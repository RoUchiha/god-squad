import type { Player, Sport, FilledRosterSlot, TeamPower, DraftMode } from '../types';
import { clamp, normalizeToRange, sigmoid } from '../utils';

// ─── Shared helpers ───────────────────────────────────────────────────────────

// Linear z-score
function z(value: number, mean: number, std: number): number {
  return std === 0 ? 0 : (value - mean) / std;
}

// Parse the start year out of an eraId like "nba-14-1995" → 1995
function eraYear(p: Player): number {
  if (!p.eraId) return 2000;
  const parts = p.eraId.split('-');
  return parseInt(parts[parts.length - 1]) || 2000;
}

// ─── NBA: BPM-inspired scoring ────────────────────────────────────────────────
// Sources: Basketball-Reference BPM (Daniel Myers), Hollinger PER
//
// Key insight from BPM research:
//   • Steals are the highest-weighted individual box-score stat (coeff 1.256)
//   • True Shooting % (efficiency) beats raw FG% by a large margin
//   • Assists have a non-linear interaction with scoring usage
//   • Position baselines matter — a PG with 3 ast is below average; a C with 3 ast is elite
//
// TS% approximation from available data:
//   TS% ≈ FG%×0.55 + 3P%×0.22 + FT%×0.23 + volumeBonus
//   volumeBonus = max(0, pts − 15) × 0.003   (high scorers draw fouls → extra TS% lift)

function scoreNBAPlayer(p: Player): number {
  const s = p.stats;
  const pts = s.points   ?? 0;
  const reb = s.rebounds ?? 0;
  const ast = s.assists  ?? 0;
  const stl = s.steals   ?? 0;
  const blk = s.blocks   ?? 0;
  const fg  = s.fieldGoalPct    ?? 0.45;
  const tp  = s.threePointPct   ?? 0.33;
  const ft  = s.freeThrowPct    ?? 0.73;

  // Approximate True Shooting % from available percentages + volume boost
  const tsApprox = fg * 0.55 + tp * 0.22 + ft * 0.23 + Math.max(0, pts - 15) * 0.003;

  // Position-adjusted baselines: what "average starter" looks like per spot
  type PosKey = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  const BL: Record<PosKey, { pts: number; reb: number; ast: number; stl: number; blk: number; ts: number }> = {
    PG: { pts: 14.0, reb: 3.5, ast: 7.0, stl: 1.3, blk: 0.3, ts: 0.536 },
    SG: { pts: 15.0, reb: 4.0, ast: 3.5, stl: 1.1, blk: 0.3, ts: 0.538 },
    SF: { pts: 15.5, reb: 6.0, ast: 3.0, stl: 1.0, blk: 0.6, ts: 0.534 },
    PF: { pts: 14.5, reb: 8.5, ast: 2.0, stl: 0.7, blk: 1.0, ts: 0.534 },
    C:  { pts: 11.5, reb: 9.5, ast: 2.0, stl: 0.6, blk: 1.5, ts: 0.548 },
  };
  const b = BL[p.position as PosKey] ?? BL.SF;

  // Standard deviations across the NBA starter population
  const SD = { pts: 7.0, reb: 3.0, ast: 2.5, stl: 0.45, blk: 0.55, ts: 0.042 };

  // Linear z-scores vs position baseline
  const TSZ = z(tsApprox,  b.ts,  SD.ts);
  const STZ = z(stl,       b.stl, SD.stl);  // steals: highest BPM coefficient
  const PTZ = z(pts,       b.pts, SD.pts);
  const ASZ = z(ast,       b.ast, SD.ast);
  const BLZ = z(blk,       b.blk, SD.blk);
  const REZ = z(reb,       b.reb, SD.reb);

  // BPM-calibrated weights (steals 1.4, TS% 1.3, pts 1.1, ast 1.0, blk 0.8, reb 0.5)
  const rawScore = TSZ * 1.3 + STZ * 1.4 + PTZ * 1.1 + ASZ * 1.0 + BLZ * 0.8 + REZ * 0.5;

  // Scale: all-time great (Jordan/Curry/LeBron era) → ~88–94; bench player → ~18–25
  const raw = 50 + rawScore * 4.5;
  return clamp(raw, 10, 95);
}

// ─── NFL Offense: Passer Rating + AV-inspired ────────────────────────────────
// Sources: Official NFL Passer Rating formula (max 158.3, avg ~88 modern era)
//          PFR Approximate Value methodology
//
// QB: Passer rating is the primary efficiency metric (already combines completion%,
//     yards/attempt, TD%, INT%) — do NOT double-count by also z-scoring TDs/yards
//     separately at full weight. We add scaled volume bonuses on top.
// RB: Rushing yards are 60% of value (Approximate Value allocation: 22% of skill pts)
// WR/TE: Receiving yards + TDs + receptions; YAC and route-running not captured
// Era adjustment: pre-1978 run-heavy era had much lower passer ratings by design

function scoreNFLOffensePlayer(p: Player): number {
  const s = p.stats;
  const yr = eraYear(p);

  // Era-adjusted passer rating baseline: the league average shifted significantly
  // pre-1978 (before the pass-friendly rules), post-2011 (no-contact era)
  const prMean = yr < 1978 ? 68 : yr < 1994 ? 77 : yr < 2011 ? 86 : 92;
  const prStd  = 14;

  if (p.position === 'QB') {
    const ratingZ  = z(s.passerRating  ?? prMean, prMean, prStd);      // efficiency (primary)
    const yardsZ   = z(s.passingYards  ?? 3000,   3400,   950);        // volume bonus
    const tdsZ     = z(s.passingTDs    ?? 22,      25,     9);          // volume bonus

    // Passer rating already encodes TD% and INT% — give it most of the weight
    const rawScore = ratingZ * 1.6 + yardsZ * 0.6 + tdsZ * 0.5;
    return clamp(50 + rawScore * 8, 20, 95);
  }

  if (p.position === 'RB') {
    // Era-adjusted rushing baselines: modern RBs see fewer carries (committee systems)
    const rushMean = yr < 1990 ? 1150 : yr < 2010 ? 1000 : 850;
    const rushStd  = 380;
    const rushZ = z(s.rushingYards ?? 600, rushMean, rushStd);
    const tdZ   = z(s.rushingTDs   ?? 6,   8,        4);
    const rawScore = rushZ * 1.4 + tdZ * 0.9;
    return clamp(50 + rawScore * 9, 20, 95);
  }

  if (p.position === 'WR' || p.position === 'TE') {
    // Receiving production: yards primary, TDs and receptions secondary
    const recYdMean = p.position === 'WR' ? 900 : 700;
    const rcvZ = z(s.receivingYards ?? 500, recYdMean, 380);
    const tdZ  = z(s.receivingTDs   ?? 5,   6,         3);
    const recZ = z(s.receptions     ?? 55,  65,         25);
    // Yards/catch efficiency proxy: bonus for fewer catches for same yards
    const ypc = (s.receptions ?? 1) > 0 ? (s.receivingYards ?? 0) / (s.receptions ?? 1) : 0;
    const ypcBonus = clamp((ypc - 12) / 4, -1, 2);  // elite YPC is a plus

    const rawScore = rcvZ * 1.3 + tdZ * 1.0 + recZ * 0.5 + ypcBonus;
    return clamp(50 + rawScore * 8.5, 20, 95);
  }

  if (p.position === 'K') {
    // Kickers: approximated by accolades; stats not granular enough for reliable ranking
    return p.isLegend ? 75 : p.isAllStar ? 62 : 50;
  }

  return 50;
}

// ─── NFL Defense: Sack-weighted with AV methodology ──────────────────────────
// Sources: PFR AV — sacks worth 1 AV pt each (added directly), tackles at 0.04/tackle
//          Interceptions worth 4× the value of a tackle in AV
// Insight: pass rush and ball-hawking vastly outvalue pure tackle counts

function scoreNFLDefensePlayer(p: Player): number {
  const s = p.stats;

  if (p.position === 'DE') {
    // Edge rushers: sacks are primary value (AV: 1 pt/sack)
    const sackZ = z(s.sacks   ?? 5, 9,  5.5);   // elite DE averages 10-15/yr
    const tklZ  = z(s.tackles ?? 35, 45, 18);
    const ffZ   = z(s.forcedFumbles ?? 1, 2, 1.5);
    const rawScore = sackZ * 1.7 + tklZ * 0.6 + ffZ * 0.5;
    return clamp(50 + rawScore * 8, 20, 95);
  }

  if (p.position === 'DT') {
    // Interior DL: sacks less common but highly valuable; tackles + run-stop
    const sackZ = z(s.sacks   ?? 3, 4,  3);
    const tklZ  = z(s.tackles ?? 35, 40, 17);
    const rawScore = sackZ * 1.5 + tklZ * 0.9;
    return clamp(50 + rawScore * 8, 20, 95);
  }

  if (p.position === 'LB') {
    // Linebackers: tackles primary volume stat, plus sacks and INTs for elite players
    const tklZ  = z(s.tackles       ?? 80, 95,  30);
    const sackZ = z(s.sacks         ?? 3,  4,   3);
    const intZ  = z(s.interceptions ?? 1,  1.5, 1.5);
    const ffZ   = z(s.forcedFumbles ?? 1,  1.5, 1);
    // AV-inspired: INT >> sack >> tackle for per-play value; balance with volume
    const rawScore = tklZ * 0.9 + sackZ * 1.1 + intZ * 1.4 + ffZ * 0.5;
    return clamp(50 + rawScore * 7.5, 20, 95);
  }

  if (p.position === 'CB' || p.position === 'S') {
    // DBs: interceptions are highest-value play in football per AV methodology (4× tackle)
    const intZ  = z(s.interceptions    ?? 1.5, 2.5,  2.0);
    const pdZ   = z(s.passDeflections  ?? 6,   9,    5);
    const tklZ  = z(s.tackles          ?? 55,  65,   22);
    const ffZ   = z(s.forcedFumbles    ?? 0.5, 1,    0.8);
    // INTs weighted most (AV: 4 pts each); pass deflections secondary coverage metric
    const rawScore = intZ * 1.6 + pdZ * 0.9 + tklZ * 0.6 + ffZ * 0.4;
    return clamp(50 + rawScore * 7.5, 20, 95);
  }

  return 50;
}

// ─── MLB Batter: wOBA-inspired (FanGraphs methodology) ───────────────────────
// Sources: FanGraphs wOBA weights (BB: 0.690, 1B: 0.878, 2B: 1.242, HR: 2.015)
//          OBP is worth ~1.8× the value of SLG in wOBA run creation
//          wRC+ = league-adjusted run creation per plate appearance
//
// wOBA approximation from OBP + SLG (we have both):
//   wOBA ≈ OBP × 1.10 + SLG × 0.70   (reflects wOBA BB/single weighting vs extra bases)
// League avg: OBP 0.320 × 1.10 + SLG 0.410 × 0.70 = 0.352 + 0.287 = 0.639

function scoreMLBBatter(p: Player): number {
  const s = p.stats;
  const obp = s.onBasePct  ?? s.ops !== undefined ? (s.ops ?? 0.750) * 0.42 : 0.320;
  const slg = s.sluggingPct ?? s.ops !== undefined ? (s.ops ?? 0.750) * 0.58 : 0.410;
  const hr  = s.homeRuns   ?? 0;
  const sb  = s.stolenBases ?? 0;

  // wOBA-weighted run creation (OBP weighted 1.57× SLG by wOBA coefficient ratio)
  const wOBA = obp * 1.10 + slg * 0.70;
  const LG_WOBA_MEAN = 0.639;
  const LG_WOBA_STD  = 0.085;
  const wOBAZ = z(wOBA, LG_WOBA_MEAN, LG_WOBA_STD);

  // Power bonus: HR are highest-value event in wOBA (weight 2.015); reward elite HR output
  const hrBonus = clamp(hr / 55, 0, 1) * 12;
  // Speed bonus: SB creates runs above and beyond wOBA (baserunning runs ≈ +0.2 runs/SB)
  const sbBonus = clamp(sb / 60, 0, 1) * 5;

  const raw = 50 + wOBAZ * 16 + hrBonus + sbBonus;
  return clamp(raw, 10, 95);
}

// ─── MLB Pitcher: FIP-inspired (defense-independent) ─────────────────────────
// Sources: FanGraphs FIP = (13×HR + 3×(BB+HBP) − 2×K) / IP + cFIP
//          xFIP replaces HR with expected HR based on fly-ball rate
// We lack HR, BB, IP split; approximate via ERA + WHIP (correlated proxies) + K/9
// Lower ERA/WHIP = better; K/9 = stuff
//
// ERA correlates most with FIP among available stats (r ≈ 0.82 career, lower in-season)
// WHIP captures walk+ hit prevention which FIP's BB term addresses
// K/9 is the cleanest individual skill metric (defense-independent by definition)

function scoreMLBPitcher(p: Player): number {
  const s = p.stats;
  const era  = s.era  ?? 4.00;
  const whip = s.whip ?? 1.30;
  const k9   = s.strikeoutsPerNine ?? 8.0;

  // Lower ERA/WHIP is better — negate before z-scoring
  // Elite SP: ERA ~2.5, WHIP ~1.00, K/9 ~10+
  // Average SP: ERA ~4.00, WHIP ~1.30, K/9 ~7.5
  const eraZ  = z(-era,  -3.90, 0.80);   // std deviation represents starter spread
  const whipZ = z(-whip, -1.27, 0.18);
  const k9Z   = z(k9,     7.8,  2.4);

  // FIP-inspired weights: K/9 is purest skill, ERA captures outcomes, WHIP captures control
  const rawScore = eraZ * 1.3 + whipZ * 1.1 + k9Z * 1.0;

  // Closer bonus: saves indicate high-leverage dominance; elite closers ~ +8 pts
  const saveBonus = p.position === 'CL' ? clamp((s.saves ?? 0) / 50, 0, 1) * 10 : 0;

  const raw = 50 + rawScore * 8 + saveBonus;
  return clamp(raw, 10, 95);
}

// ─── NHL Skater: Point Shares + era-adjusted baseline ────────────────────────
// Sources: Hockey-Reference Point Shares (Justin Kubatko)
//          Evolving Hockey xGAR (goals above replacement)
//
// Critical: scoring rates varied enormously by era
//   1980–91 (high-offense): league avg ~50 pts/player/yr, Gretzky had 163–215
//   1992–04 (transition):   league avg ~45 pts
//   2005–13 (post-lockout): league avg ~40 pts, elite ~90
//   2014+   (modern):       league avg ~38 pts, elite ~80–90
// We adjust the points baseline so a given raw total is judged against its era peers.

function scoreNHLSkater(p: Player): number {
  const s   = p.stats;
  const yr  = eraYear(p);

  // Era-adjusted points baseline (per full season equivalent)
  const ptsMean = yr < 1992 ? 72 : yr < 2005 ? 60 : yr < 2015 ? 52 : 48;
  const ptsStd  = yr < 1992 ? 32 : 26;

  // Plus-minus baseline: higher in defensive-era, lower in run-and-gun era
  const pmMean = yr < 1992 ? 5 : 0;
  const pmStd  = 18;

  const ptsZ   = z(s.nhlPoints ?? ptsMean, ptsMean, ptsStd);
  const pmZ    = z(s.plusMinus ?? 0,       pmMean,  pmStd);
  const ppBonus = clamp((s.powerPlayGoals ?? 0) * 0.9, 0, 10);

  // Points (offense proxy) weighted more; plus-minus adds defensive context
  const rawScore = ptsZ * 1.5 + pmZ * 0.9;
  const raw = 50 + rawScore * 9 + ppBonus;
  return clamp(raw, 10, 95);
}

// ─── NHL Goalie: Save% + GAA (defense-independent quality) ───────────────────
// Save% is era-independent and the cleanest single goalie metric
// GAA is context-dependent (team defense) but useful alongside Sv%

function scoreNHLGoalie(p: Player): number {
  const s  = p.stats;
  const yr = eraYear(p);

  // Sv% improved with equipment/rules: pre-1990 average ~0.878, modern ~0.910
  const svMean = yr < 1992 ? 0.878 : yr < 2005 ? 0.900 : 0.911;
  const svStd  = 0.012;

  // GAA: lower is better, era-adjusted baseline
  const gaaMean = yr < 1992 ? 3.5 : yr < 2005 ? 2.9 : 2.65;
  const gaaStd  = 0.40;

  const svZ  = z(s.savePct          ?? svMean,   svMean,  svStd);
  const gaaZ = z(-(s.goalsAgainstAvg ?? gaaMean), -gaaMean, gaaStd);

  // Sv% slightly more predictive of true talent than GAA (GAA team-dependent)
  const rawScore = svZ * 1.3 + gaaZ * 1.0;
  const raw = 50 + rawScore * 10;
  return clamp(raw, 10, 95);
}

export function computePlayerScore(player: Player, sport: Sport): number {
  let base: number;

  switch (sport) {
    case 'nba':
      base = scoreNBAPlayer(player);
      break;
    case 'nfl':
      if (player.positionGroup === 'offense') base = scoreNFLOffensePlayer(player);
      else base = scoreNFLDefensePlayer(player);
      break;
    case 'mlb':
      if (player.positionGroup === 'offense') base = scoreMLBBatter(player);
      else base = scoreMLBPitcher(player);
      break;
    case 'nhl':
      if (player.position === 'G_NHL') base = scoreNHLGoalie(player);
      else base = scoreNHLSkater(player);
      break;
    default:
      base = 50;
  }

  // Small accolade multiplier — new stat-based algo already captures most elite performance;
  // this just nudges players whose intangibles (defense, leadership) aren't fully in the box score
  if (player.isLegend) base = clamp(base * 1.07, 0, 100);
  else if (player.isAllStar) base = clamp(base * 1.03, 0, 100);

  return Math.round(base * 10) / 10;
}

// ─── Team GSPR Calculation ────────────────────────────────────────────────────

const SPORT_WEIGHTS: Record<Sport, { offense: number; defense: number; depth: number }> = {
  nba: { offense: 0.55, defense: 0.35, depth: 0.10 },
  nfl: { offense: 0.45, defense: 0.45, depth: 0.10 },
  mlb: { offense: 0.50, defense: 0.40, depth: 0.10 },
  nhl: { offense: 0.50, defense: 0.30, depth: 0.10 }, // goalie weight absorbed into defense
};

function weightedAverage(scores: number[], weights?: number[]): number {
  if (scores.length === 0) return 0;
  if (!weights) return scores.reduce((a, b) => a + b, 0) / scores.length;
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  return scores.reduce((acc, s, i) => acc + s * (weights[i] ?? 1), 0) / totalWeight;
}

// ─── Historic duo bonus ───────────────────────────────────────────────────────
const HISTORIC_DUOS: [string, string, number, string][] = [
  // NBA
  ['Michael Jordan',      'Scottie Pippen',      10, '🐐 Jordan & Pippen — Greatest Duo Ever'],
  ['Magic Johnson',       'Kareem Abdul-Jabbar',  9, '✨ Magic & Kareem — Showtime'],
  ["Shaquille O'Neal",    'Kobe Bryant',           8, '🔥 Shaq & Kobe — Three-Peat'],
  ['LeBron James',        'Dwyane Wade',           7, '👑 LeBron & Wade — Heat Big Three'],
  ['LeBron James',        'Anthony Davis',         7, '💪 LeBron & AD — Lake Show'],
  ['LeBron James',        'Kyrie Irving',          8, '🏆 LeBron & Kyrie — Cavs Champions'],
  ['Stephen Curry',       'Klay Thompson',         8, '🎯 Curry & Klay — Splash Brothers'],
  ['Stephen Curry',       'Draymond Green',        6, '🧠 Curry & Draymond — Warriors IQ'],
  ['Kevin Durant',        'Stephen Curry',         9, '⚡ KD & Curry — Unstoppable Force'],
  ['Larry Bird',          'Kevin McHale',          7, '☘️ Bird & McHale — Celtics Frontcourt'],
  ['Larry Bird',          'Robert Parish',         6, '☘️ Bird & Parish — Celtics Big Three'],
  ['Tim Duncan',          'Tony Parker',           7, '🪨 Duncan & Parker — Spurs Dynasty'],
  ['Tim Duncan',          'Manu Ginobili',         6, '🪨 Duncan & Ginobili — Spurs Big Three'],
  ['Tony Parker',         'Manu Ginobili',         6, '🇫🇷 Parker & Ginobili — International Flair'],
  ['Hakeem Olajuwon',     'Clyde Drexler',         7, '🚀 Hakeem & Clyde — Dream Team'],
  ['Isiah Thomas',        'Joe Dumars',            7, '😈 Isiah & Dumars — Bad Boys Backcourt'],
  ['Kevin Garnett',       'Paul Pierce',           7, '☘️ KG & Pierce — Boston Revived'],
  ['Kevin Garnett',       'Ray Allen',             6, '☘️ KG & Ray Allen — Banner 17'],
  ['Giannis Antetokounmpo','Khris Middleton',      7, '🦌 Giannis & Middleton — Bucks Champions'],
  ['Nikola Jokic',        'Jamal Murray',          7, '⛏️ Jokic & Murray — Mile High Magic'],
  ['Kawhi Leonard',       'Paul George',           7, '🦞 Kawhi & PG — Clippers Threat'],
  ['Karl Malone',         'John Stockton',         9, '📮 Malone & Stockton — Mailman Express'],
  ['Charles Barkley',     'Kevin Johnson',         6, '🌵 Barkley & KJ — Suns Machine'],
  ['Patrick Ewing',       'Charles Oakley',        5, '🗽 Ewing & Oakley — Knicks Bruisers'],
  // NFL
  ['Tom Brady',           'Rob Gronkowski',        9, '🏈 Brady & Gronk — Unstoppable'],
  ['Tom Brady',           'Randy Moss',            9, '🏈 Brady & Moss — Record Breakers'],
  ['Joe Montana',         'Jerry Rice',            10, '🐐 Montana & Rice — GOAT Connection'],
  ['Peyton Manning',      'Marvin Harrison',       8, '🏹 Manning & Harrison — Precision'],
  ['Peyton Manning',      'Reggie Wayne',          7, '🏹 Manning & Wayne — AFC Dominance'],
  ['Aaron Rodgers',       'Davante Adams',         7, '🎯 Rodgers & Adams — Fade Route Kings'],
  ['Aaron Rodgers',       'Jordy Nelson',          6, '💛 Rodgers & Jordy — Packer Magic'],
  ['Patrick Mahomes',     'Travis Kelce',          8, '⚡ Mahomes & Kelce — Dynasty Duo'],
  ['Troy Aikman',         'Michael Irvin',         7, '⭐ Aikman & Irvin — Cowboys WR'],
  ['Dan Marino',          'Mark Clayton',          6, '🌴 Marino & Clayton — Miami Air'],
  ['Lawrence Taylor',     'Carl Banks',            6, '😤 LT & Banks — Giants Defense'],
  ['Emmitt Smith',        'Michael Irvin',         6, '⭐ Smith & Irvin — Cowboys Offense'],
  ['Barry Sanders',       'Herman Moore',          6, '🦁 Sanders & Moore — Lions Magic'],
  ['Steve Young',         'Jerry Rice',            8, '🌉 Young & Rice — 49ers Reload'],
  ['John Elway',          'Shannon Sharpe',        6, '🏔️ Elway & Sharpe — Broncos Champions'],
  // MLB
  ['Babe Ruth',           'Lou Gehrig',            10, '⚾ Ruth & Gehrig — Murderers Row'],
  ['Mickey Mantle',       'Whitey Ford',           8, '⚾ Mantle & Ford — Yankee Dynasty'],
  ['Derek Jeter',         'Mariano Rivera',        9, '⚾ Jeter & Mo — Core Four'],
  ['Willie Mays',         'Willie McCovey',        7, '⚾ Mays & McCovey — Giants Power'],
  ['Hank Aaron',          'Eddie Mathews',         8, '⚾ Aaron & Mathews — Braves Thunder'],
  ['Greg Maddux',         'Tom Glavine',           8, '⚾ Maddux & Glavine — Braves Rotation'],
  ['Ken Griffey Jr.',     'Randy Johnson',         7, '⚾ Griffey & Big Unit — Seattle Legends'],
  ['Albert Pujols',       'Jim Edmonds',           6, '⚾ Pujols & Edmonds — Cards Machine'],
  ['Pedro Martinez',      'Manny Ramirez',         7, '⚾ Pedro & Manny — Sox World Series'],
  ['David Ortiz',         'Manny Ramirez',         7, '⚾ Ortiz & Manny — Boston Clutch'],
  // NHL
  ['Wayne Gretzky',       'Mark Messier',          10, '🏒 Gretzky & Messier — Oilers Dynasty'],
  ['Wayne Gretzky',       'Jari Kurri',             9, '🏒 Gretzky & Kurri — Scoring Machine'],
  ['Mario Lemieux',       'Jaromir Jagr',           9, '🏒 Lemieux & Jagr — Penguins Glory'],
  ['Sidney Crosby',       'Evgeni Malkin',          8, '🏒 Crosby & Malkin — Double Threat'],
  ['Sidney Crosby',       'Marc-Andre Fleury',      7, '🏒 Crosby & Fleury — Penguins Core'],
  ['Patrick Roy',         'Joe Sakic',              8, '🏒 Roy & Sakic — Avs Champions'],
  ['Steve Yzerman',       'Nicklas Lidstrom',       8, '🏒 Yzerman & Lidstrom — Wings Dynasty'],
  ['Bobby Orr',           'Phil Esposito',          9, '🏒 Orr & Esposito — Bruins Gold'],
  ['Gordie Howe',         'Alex Delvecchio',        7, '🏒 Howe & Delvecchio — Wings Classic'],
];

// ─── Historic rival pairings ──────────────────────────────────────────────────
const HISTORIC_RIVALS: [string, string, number, string][] = [
  // NBA
  ['Larry Bird',          'Magic Johnson',       5, '🔥 Bird vs Magic — Ultimate Rivals'],
  ['Larry Bird',          'Kareem Abdul-Jabbar', 4, '🔥 Bird vs Kareem — Old-School Clash'],
  ['Bill Russell',        'Wilt Chamberlain',    5, '🔥 Russell vs Wilt — Centers Rivalry'],
  ['Michael Jordan',      'Isiah Thomas',        4, '🔥 Jordan vs Isiah — Bad Boys vs Bull'],
  ['LeBron James',        'Kobe Bryant',         4, '🔥 LeBron vs Kobe — The Debate'],
  ['Stephen Curry',       'LeBron James',        4, '🔥 Curry vs LeBron — Finals Rivals'],
  // NFL
  ['Peyton Manning',      'Ray Lewis',           4, '🔥 Manning vs Lewis — Rivals'],
  ['Tom Brady',           'Peyton Manning',      5, '🔥 Brady vs Manning — AFC Legends'],
  ['Tom Brady',           'Aaron Rodgers',       4, '🔥 Brady vs Rodgers — QB Debate'],
  ['Jerry Rice',          'Deion Sanders',       4, '🔥 Rice vs Prime Time'],
  // MLB
  ['Babe Ruth',           'Ty Cobb',             4, '🔥 Ruth vs Cobb — Era Rivals'],
  ['Derek Jeter',         'Manny Ramirez',       4, '🔥 Jeter vs Manny — Sox/Yanks'],
  ['Pedro Martinez',      'Roger Clemens',       4, '🔥 Pedro vs Clemens — Ace Rivals'],
  // NHL
  ['Wayne Gretzky',       'Mario Lemieux',       5, '🔥 Gretzky vs Lemieux — GOAT Debate'],
  ['Patrick Roy',         'Chris Chelios',       4, '🔥 Roy vs Chelios — Classic Clash'],
  ['Sidney Crosby',       'Alex Ovechkin',       5, '🔥 Crosby vs Ovechkin — Modern Rivals'],
];

interface BonusResult { total: number; labels: string[] }

function duoAndRivalBonus(players: Player[]): BonusResult {
  const names = players.map(p => p.name);
  const labels: string[] = [];
  let duoBonus = 0;
  let bestLabel = '';
  for (const [a, b, pts, label] of HISTORIC_DUOS) {
    if (names.includes(a) && names.includes(b) && pts > duoBonus) {
      duoBonus = pts;
      bestLabel = label;
    }
  }
  if (duoBonus > 0) labels.push(bestLabel);

  let rivalBonus = 0;
  for (const [a, b, pts, label] of HISTORIC_RIVALS) {
    if (names.includes(a) && names.includes(b)) {
      rivalBonus += pts * 0.5;
      labels.push(label);
    }
  }
  return { total: duoBonus + rivalBonus, labels };
}

// ─── Era chemistry bonus ──────────────────────────────────────────────────────
function eraChemistryBonus(players: Player[]): BonusResult {
  const eraIds = players.map(p => p.eraId).filter((e): e is string => Boolean(e));
  if (eraIds.length < 3) return { total: 0, labels: [] };
  const unique = new Set(eraIds);
  if (unique.size === 1) return { total: 8, labels: ['🕰️ Era Synergy — Same-Era Perfection (+8)'] };
  if (unique.size === 2) return { total: 3, labels: ['🕰️ Era Blend — Cross-Era Chemistry (+3)'] };
  return { total: 0, labels: [] };
}

// ─── Team chemistry bonus ─────────────────────────────────────────────────────
function teamChemistryBonus(players: Player[]): BonusResult {
  const teamIds = players.map(p => p.teamId).filter((t): t is string => Boolean(t));
  if (teamIds.length < 2) return { total: 0, labels: [] };
  const counts: Record<string, number> = {};
  for (const t of teamIds) counts[t] = (counts[t] ?? 0) + 1;
  const max = Math.max(...Object.values(counts));
  if (max >= 5) return { total: 10, labels: ['🤝 Dynasty Core — 5+ Teammates (+10)'] };
  if (max >= 3) return { total: 5,  labels: ['🤝 Familiar Faces — 3+ Teammates (+5)'] };
  if (max >= 2) return { total: 2,  labels: ['🤝 Familiar Faces — 2 Teammates (+2)'] };
  return { total: 0, labels: [] };
}

// ─── Physical composition bonus ───────────────────────────────────────────────
function physicalBonus(players: Player[], sport: Sport): BonusResult {
  if (sport !== 'nba') return { total: 0, labels: [] };

  const heightMap: Record<string, number> = { C: 84, PF: 81, SF: 79, SG: 76, PG: 73 };
  const heights = players.map(p => heightMap[p.position] ?? 77);
  const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;

  const centers = players.filter(p => p.position === 'C').length;
  const bigs    = players.filter(p => p.position === 'C' || p.position === 'PF').length;

  const labels: string[] = [];
  let bonus = 0;
  if (centers >= 2) { bonus += 8; labels.push('🏗️ Twin Towers — Dominant Inside (+8)'); }
  else if (bigs >= 3) { bonus += 5; labels.push('💪 Big Lineup — Frontcourt Dominance (+5)'); }
  if (avgHeight >= 80) { bonus += 3; labels.push('📏 Tall Team — Height Advantage (+3)'); }
  return { total: bonus, labels };
}

// ─── Stat-based combo bonuses ─────────────────────────────────────────────────
function statComboBonus(players: Player[], sport: Sport): BonusResult {
  if (sport !== 'nba') return { total: 0, labels: [] };

  const labels: string[] = [];
  let bonus = 0;

  // Alley-oop engine: a high-assist PG paired with a high-athleticism dunker (SG/SF with high blocks/pts)
  const passers = players.filter(p => p.position === 'PG' && (p.stats.assists ?? 0) >= 8);
  const dunkers = players.filter(p =>
    (p.position === 'SG' || p.position === 'SF' || p.position === 'PF') &&
    (p.stats.points ?? 0) >= 20 && (p.stats.blocks ?? 0) >= 0.8
  );
  if (passers.length > 0 && dunkers.length > 0) {
    bonus += 8;
    labels.push(`🔛 Alley-Oop Factory — ${passers[0].name} feeds ${dunkers[0].name} (+8)`);
  }

  // Deadeye shooter + facilitator: 3pt% > 0.40 shooter + assists > 8 player
  const snipers = players.filter(p => (p.stats.threePointPct ?? 0) >= 0.40 && (p.stats.points ?? 0) >= 15);
  const facilitators = players.filter(p => (p.stats.assists ?? 0) >= 8 && p !== (passers[0] ?? null));
  if (snipers.length >= 2 && facilitators.length > 0) {
    bonus += 7;
    labels.push(`🎯 Deadeye Arsenal — ${snipers[0].name} & ${snipers[1].name} off assists (+7)`);
  } else if (snipers.length >= 2) {
    bonus += 5;
    labels.push(`🎯 Sniper Duo — ${snipers[0].name} & ${snipers[1].name} shoot lights out (+5)`);
  }

  // Rim protector + scorer: C/PF with blocks >= 2 + SG/SF with pts >= 22
  const rimProtectors = players.filter(p =>
    (p.position === 'C' || p.position === 'PF') && (p.stats.blocks ?? 0) >= 2
  );
  const eliteScorers = players.filter(p =>
    (p.position === 'SG' || p.position === 'SF' || p.position === 'PG') && (p.stats.points ?? 0) >= 22
  );
  if (rimProtectors.length > 0 && eliteScorers.length > 0) {
    bonus += 7;
    labels.push(`🛡️ Defend & Attack — ${rimProtectors[0].name} protects, ${eliteScorers[0].name} scores (+7)`);
  }

  // Inside-outside: dominant big (pts >= 20, reb >= 10) + perimeter threat (3pt% >= 0.38, pts >= 15)
  const dominantBigs = players.filter(p =>
    (p.position === 'C' || p.position === 'PF') &&
    (p.stats.points ?? 0) >= 20 && (p.stats.rebounds ?? 0) >= 10
  );
  const perimeterThreats = players.filter(p =>
    (p.position === 'PG' || p.position === 'SG' || p.position === 'SF') &&
    (p.stats.threePointPct ?? 0) >= 0.38 && (p.stats.points ?? 0) >= 15
  );
  if (dominantBigs.length > 0 && perimeterThreats.length > 0) {
    bonus += 6;
    labels.push(`⚖️ Inside-Outside — ${dominantBigs[0].name} in the post, ${perimeterThreats[0].name} from deep (+6)`);
  }

  // Triple-double threat: player with pts >= 20, reb >= 8, ast >= 7
  const tripleDoubleThreats = players.filter(p =>
    (p.stats.points ?? 0) >= 20 &&
    (p.stats.rebounds ?? 0) >= 8 &&
    (p.stats.assists ?? 0) >= 7
  );
  if (tripleDoubleThreats.length >= 2) {
    bonus += 10;
    labels.push(`🌟 Double Triple-Double Threat — ${tripleDoubleThreats[0].name} & ${tripleDoubleThreats[1].name} (+10)`);
  } else if (tripleDoubleThreats.length === 1) {
    bonus += 5;
    labels.push(`🌟 Triple-Double Threat — ${tripleDoubleThreats[0].name} does it all (+5)`);
  }

  return { total: bonus, labels };
}

export function computeTeamGSPR(
  slots: FilledRosterSlot[],
  sport: Sport,
  mode: DraftMode
): TeamPower {
  const filled = slots.filter(s => s.player !== null);
  const players = filled.map(s => s.player as Player);

  if (players.length === 0) {
    return { gspr: 0, offenseScore: 0, defenseScore: 0, depthScore: 0, chemistryBonus: 0, tier: 'average', breakdown: [] };
  }

  const offPlayers = players.filter(p => p.positionGroup === 'offense' || (sport === 'nba'));
  const defPlayers = players.filter(p =>
    p.positionGroup === 'defense' ||
    p.positionGroup === 'pitching' ||
    p.positionGroup === 'goalie'
  );

  // Starters weighted more heavily
  const buildWeights = (arr: Player[]) =>
    arr.map((_, i) => Math.max(1, 1.5 - i * 0.1));

  const offenseScore = offPlayers.length > 0
    ? weightedAverage(offPlayers.map(p => p.playerScore), buildWeights(offPlayers))
    : mode === 'defense' ? 55 : 0; // assume league-average offense if defense-only

  const defenseScore = defPlayers.length > 0
    ? weightedAverage(defPlayers.map(p => p.playerScore), buildWeights(defPlayers))
    : mode === 'offense' ? 55 : 0;

  // Depth: bonus for filling all required slots
  const required = slots.filter(s => s.required);
  const filledRequired = required.filter(s => s.player !== null);
  const depthScore = required.length > 0
    ? (filledRequired.length / required.length) * 100
    : 80;

  const duoRival   = duoAndRivalBonus(players);
  const eraChem    = eraChemistryBonus(players);
  const teamChem   = teamChemistryBonus(players);
  const physical   = physicalBonus(players, sport);
  const statCombo  = statComboBonus(players, sport);
  const totalBonus = duoRival.total + eraChem.total + teamChem.total + physical.total + statCombo.total;

  const w = SPORT_WEIGHTS[sport];
  const raw = (
    offenseScore * w.offense +
    defenseScore * w.defense +
    depthScore * w.depth +
    totalBonus * 0.12
  );

  // Scale to 0–1000
  const gspr = Math.round(clamp(raw * 10, 0, 1000));

  const tier = gspr >= 950 ? 'god'
    : gspr >= 850 ? 'legendary'
    : gspr >= 700 ? 'great'
    : gspr >= 500 ? 'good'
    : 'average';

  const breakdownParts: string[] = [
    `📊 Offense: ${Math.round(offenseScore)}/100`,
    `🛡️ Defense: ${Math.round(defenseScore)}/100`,
    `📋 Depth: ${Math.round(depthScore)}/100`,
    ...duoRival.labels,
    ...eraChem.labels,
    ...teamChem.labels,
    ...physical.labels,
    ...statCombo.labels,
  ];

  return { gspr, offenseScore, defenseScore, depthScore, chemistryBonus: totalBonus, tier, breakdown: breakdownParts };
}
