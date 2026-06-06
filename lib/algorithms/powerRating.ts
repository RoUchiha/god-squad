import type { Player, Sport, FilledRosterSlot, TeamPower, DraftMode } from '../types';
import { clamp, normalizeToRange, sigmoid } from '../utils';

// ─── Era normalization constants ─────────────────────────────────────────────
// These represent typical seasonal averages for each era, used to z-score stats

interface EraNorms {
  points?: { mean: number; std: number };
  rebounds?: { mean: number; std: number };
  assists?: { mean: number; std: number };
  ops?: { mean: number; std: number };
  era?: { mean: number; std: number };
  nhlPoints?: { mean: number; std: number };
  passingYards?: { mean: number; std: number };
  rushingYards?: { mean: number; std: number };
  sacks?: { mean: number; std: number };
}

const NBA_NORMS: EraNorms = {
  points:   { mean: 18, std: 8 },
  rebounds: { mean: 7,  std: 3.5 },
  assists:  { mean: 5,  std: 3 },
};

const NFL_OFF_NORMS: EraNorms = {
  passingYards: { mean: 3800, std: 900 },
  rushingYards: { mean: 900, std: 400 },
};

const NFL_DEF_NORMS: EraNorms = {
  sacks:         { mean: 10, std: 5 },
};

const MLB_NORMS: EraNorms = {
  ops: { mean: 0.760, std: 0.100 },
  era: { mean: 4.0,   std: 0.9 },
};

const NHL_NORMS: EraNorms = {
  nhlPoints: { mean: 50, std: 25 },
};

// ─── Individual Player Score (0–100) ─────────────────────────────────────────

function scoreNBAPlayer(p: Player): number {
  const s = p.stats;
  const ptsZ = normalizeToRange(s.points ?? 0, 18, 8);
  const rebZ = normalizeToRange(s.rebounds ?? 0, 7, 3.5);
  const astZ = normalizeToRange(s.assists ?? 0, 5, 3);
  const fgBonus  = (s.fieldGoalPct ?? 0.45) > 0.50 ? 5 : 0;
  const stlBlkBonus = ((s.steals ?? 0) + (s.blocks ?? 0)) * 2;

  const raw = ptsZ * 0.40 + rebZ * 0.25 + astZ * 0.25 + fgBonus + clamp(stlBlkBonus, 0, 10);
  return clamp(raw, 0, 100);
}

function scoreNFLOffensePlayer(p: Player): number {
  const s = p.stats;
  let score = 50;

  if (p.position === 'QB') {
    const pyZ = normalizeToRange(s.passingYards ?? 0, 3800, 900);
    const tdZ = normalizeToRange(s.passingTDs ?? 0, 28, 8);
    const ratingZ = normalizeToRange(s.passerRating ?? 85, 85, 15);
    score = pyZ * 0.35 + tdZ * 0.35 + ratingZ * 0.30;
  } else if (p.position === 'RB') {
    const ryZ = normalizeToRange(s.rushingYards ?? 0, 900, 400);
    const tdZ = normalizeToRange(s.rushingTDs ?? 0, 8, 4);
    score = ryZ * 0.60 + tdZ * 0.40;
  } else if (p.position === 'WR' || p.position === 'TE') {
    const rcvZ = normalizeToRange(s.receivingYards ?? 0, 900, 350);
    const tdZ = normalizeToRange(s.receivingTDs ?? 0, 6, 3);
    const recZ = normalizeToRange(s.receptions ?? 0, 65, 25);
    score = rcvZ * 0.45 + tdZ * 0.30 + recZ * 0.25;
  } else if (p.position === 'K') {
    score = 55 + (p.isLegend ? 15 : p.isAllStar ? 8 : 0);
  }

  return clamp(score, 0, 100);
}

function scoreNFLDefensePlayer(p: Player): number {
  const s = p.stats;
  let score = 50;

  if (p.position === 'DE') {
    const sackZ = normalizeToRange(s.sacks ?? 0, 10, 5);
    const tklZ = normalizeToRange(s.tackles ?? 0, 45, 20);
    score = sackZ * 0.55 + tklZ * 0.45;
  } else if (p.position === 'DT') {
    const sackZ = normalizeToRange(s.sacks ?? 0, 6, 3);
    const tklZ = normalizeToRange(s.tackles ?? 0, 40, 18);
    score = sackZ * 0.45 + tklZ * 0.55;
  } else if (p.position === 'LB') {
    const tklZ = normalizeToRange(s.tackles ?? 0, 100, 30);
    const sackZ = normalizeToRange(s.sacks ?? 0, 5, 3);
    const intZ = normalizeToRange(s.interceptions ?? 0, 2, 2);
    score = tklZ * 0.50 + sackZ * 0.30 + intZ * 0.20;
  } else if (p.position === 'CB' || p.position === 'S') {
    const intZ = normalizeToRange(s.interceptions ?? 0, 3, 2);
    const tklZ = normalizeToRange(s.tackles ?? 0, 60, 25);
    score = intZ * 0.50 + tklZ * 0.50;
  }

  return clamp(score, 0, 100);
}

function scoreMLBBatter(p: Player): number {
  const s = p.stats;
  const opsZ = normalizeToRange(s.ops ?? 0.700, 0.760, 0.100);
  const hrBonus = clamp((s.homeRuns ?? 0) / 50 * 10, 0, 10);
  const sbBonus = clamp((s.stolenBases ?? 0) / 30 * 5, 0, 5);
  return clamp(opsZ * 0.80 + hrBonus + sbBonus, 0, 100);
}

function scoreMLBPitcher(p: Player): number {
  const s = p.stats;
  // Lower ERA is better — invert the z-score
  const eraZ = normalizeToRange(-(s.era ?? 4.0), -4.0, 0.9);
  const whipZ = normalizeToRange(-(s.whip ?? 1.30), -1.30, 0.20);
  const kZ = normalizeToRange(s.strikeoutsPerNine ?? 8.0, 8.0, 2.5);
  const saveBonus = p.position === 'CL' ? clamp((s.saves ?? 0) / 45 * 10, 0, 10) : 0;
  return clamp(eraZ * 0.40 + whipZ * 0.35 + kZ * 0.20 + saveBonus, 0, 100);
}

function scoreNHLSkater(p: Player): number {
  const s = p.stats;
  const ptsZ = normalizeToRange(s.nhlPoints ?? 50, 50, 25);
  const plusMinusZ = normalizeToRange(s.plusMinus ?? 0, 0, 15);
  const ppBonus = clamp((s.powerPlayGoals ?? 0) * 0.8, 0, 8);
  return clamp(ptsZ * 0.65 + plusMinusZ * 0.25 + ppBonus, 0, 100);
}

function scoreNHLGoalie(p: Player): number {
  const s = p.stats;
  const svPctZ = normalizeToRange(s.savePct ?? 0.910, 0.910, 0.012);
  const gaaNeg = normalizeToRange(-(s.goalsAgainstAvg ?? 2.8), -2.8, 0.4);
  return clamp(svPctZ * 0.55 + gaaNeg * 0.45, 0, 100);
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

  // Apply greatness multipliers
  if (player.isLegend) base = clamp(base * 1.15, 0, 100);
  else if (player.isAllStar) base = clamp(base * 1.08, 0, 100);

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

function chemistryBonus(players: Player[], sport: Sport): number {
  // Known dynasty cores get a bonus
  const names = players.map(p => p.name);
  const duos: [string, string, number][] = [
    ['Michael Jordan', 'Scottie Pippen', 8],
    ['Magic Johnson', 'Kareem Abdul-Jabbar', 7],
    ['Shaquille O\'Neal', 'Kobe Bryant', 6],
    ['LeBron James', 'Dwyane Wade', 6],
    ['Stephen Curry', 'Klay Thompson', 7],
    ['Tom Brady', 'Rob Gronkowski', 8],
    ['Joe Montana', 'Jerry Rice', 9],
    ['Babe Ruth', 'Lou Gehrig', 10],
    ['Wayne Gretzky', 'Mark Messier', 9],
    ['Mario Lemieux', 'Jaromir Jagr', 8],
  ];
  let bonus = 0;
  for (const [a, b, pts] of duos) {
    if (names.includes(a) && names.includes(b)) bonus = Math.max(bonus, pts);
  }
  return bonus;
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

  const chemistry = chemistryBonus(players, sport);

  const w = SPORT_WEIGHTS[sport];
  const raw = (
    offenseScore * w.offense +
    defenseScore * w.defense +
    depthScore * w.depth +
    chemistry * 0.05
  );

  // Scale to 0–1000 (raw is already 0–100 weighted, multiply by 10)
  const gspr = Math.round(clamp(raw * 10, 0, 1000));

  const tier = gspr >= 950 ? 'god'
    : gspr >= 850 ? 'legendary'
    : gspr >= 700 ? 'great'
    : gspr >= 500 ? 'good'
    : 'average';

  const breakdown: string[] = [
    `Offense: ${Math.round(offenseScore)}/100`,
    `Defense: ${Math.round(defenseScore)}/100`,
    `Depth: ${Math.round(depthScore)}/100`,
    ...(chemistry > 0 ? [`Chemistry Bonus: +${chemistry}`] : []),
  ];

  return { gspr, offenseScore, defenseScore, depthScore, chemistryBonus: chemistry, tier, breakdown };
}
