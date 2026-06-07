import type { Sport, Era, HistoricalTeam, RosterSlotTemplate, DraftMode } from './types';

// ─── Sport Metadata ─────────────────────────────────────────────────────────

export const SPORT_CONFIG: Record<Sport, {
  label: string;
  emoji: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  gamesInSeason: number;
  hasModes: boolean;
  tagline: string;
}> = {
  nba: {
    label: 'NBA',
    emoji: '🏀',
    primaryColor: '#F26522',
    accentColor: '#FDB927',
    bgColor: '#1a0f00',
    gamesInSeason: 82,
    hasModes: false,
    tagline: 'Can your squad go 82-0?',
  },
  nfl: {
    label: 'NFL',
    emoji: '🏈',
    primaryColor: '#013369',
    accentColor: '#D50A0A',
    bgColor: '#000818',
    gamesInSeason: 20,
    hasModes: true,
    tagline: 'Can your squad go 20-0?',
  },
  mlb: {
    label: 'MLB',
    emoji: '⚾',
    primaryColor: '#002D72',
    accentColor: '#E31837',
    bgColor: '#000A1A',
    gamesInSeason: 162,
    hasModes: false,
    tagline: 'Can your squad go 162-0?',
  },
  nhl: {
    label: 'NHL',
    emoji: '🏒',
    primaryColor: '#003087',
    accentColor: '#FCB514',
    bgColor: '#001020',
    gamesInSeason: 82,
    hasModes: false,
    tagline: 'Can your squad go 82-0?',
  },
  epl: {
    label: 'EPL',
    emoji: '⚽',
    primaryColor: '#3D195B',
    accentColor: '#00FF85',
    bgColor: '#0a0015',
    gamesInSeason: 38,
    hasModes: false,
    tagline: 'Can your squad go unbeaten?',
  },
  wcup: {
    label: 'World Cup',
    emoji: '🌍',
    primaryColor: '#326295',
    accentColor: '#FFD700',
    bgColor: '#000d1a',
    gamesInSeason: 7,
    hasModes: false,
    tagline: 'Can your squad win the World Cup?',
  },
};

// ─── Roster Templates ────────────────────────────────────────────────────────

export const NBA_ROSTER: RosterSlotTemplate[] = [
  { id: 'pg',    position: 'PG',                           label: 'Point Guard',    group: 'offense', required: true },
  { id: 'sg',    position: 'SG',                           label: 'Shooting Guard', group: 'offense', required: true },
  { id: 'sf',    position: 'SF',                           label: 'Small Forward',  group: 'offense', required: true },
  { id: 'pf',    position: 'PF',                           label: 'Power Forward',  group: 'offense', required: true },
  { id: 'c',     position: 'C',                            label: 'Center',         group: 'offense', required: true },
  { id: '6man',  position: ['PG','SG','SF','PF','C'],       label: '6th Man',        group: 'offense', required: true },
];

// Full starting lineup — all slots required (fantasy-team style)
export const NFL_OFFENSE_ROSTER: RosterSlotTemplate[] = [
  { id: 'qb',  position: 'QB', label: 'Quarterback',     group: 'offense', required: true },
  { id: 'rb1', position: 'RB', label: 'Running Back',    group: 'offense', required: true },
  { id: 'rb2', position: 'RB', label: 'Fullback / RB2',  group: 'offense', required: true },
  { id: 'wr1', position: 'WR', label: 'Wide Receiver 1', group: 'offense', required: true },
  { id: 'wr2', position: 'WR', label: 'Wide Receiver 2', group: 'offense', required: true },
  { id: 'wr3', position: 'WR', label: 'Slot Receiver',   group: 'offense', required: true },
  { id: 'te1', position: 'TE', label: 'Tight End',       group: 'offense', required: true },
  { id: 'te2', position: 'TE', label: 'H-Back / TE2',    group: 'offense', required: true },
  { id: 'k',   position: 'K',  label: 'Kicker',          group: 'offense', required: true },
];

export const NFL_DEFENSE_ROSTER: RosterSlotTemplate[] = [
  { id: 'de1', position: 'DE', label: 'Defensive End 1',  group: 'defense', required: true },
  { id: 'de2', position: 'DE', label: 'Defensive End 2',  group: 'defense', required: true },
  { id: 'dt1', position: 'DT', label: 'Defensive Tackle', group: 'defense', required: true },
  { id: 'dt2', position: 'DT', label: 'Nose Tackle',      group: 'defense', required: true },
  { id: 'lb1', position: 'LB', label: 'Linebacker 1',     group: 'defense', required: true },
  { id: 'lb2', position: 'LB', label: 'Linebacker 2',     group: 'defense', required: true },
  { id: 'lb3', position: 'LB', label: 'Linebacker 3',     group: 'defense', required: true },
  { id: 'cb1', position: 'CB', label: 'Cornerback 1',     group: 'defense', required: true },
  { id: 'cb2', position: 'CB', label: 'Cornerback 2',     group: 'defense', required: true },
  { id: 'fs',  position: 'S',  label: 'Free Safety',      group: 'defense', required: true },
  { id: 'ss',  position: 'S',  label: 'Strong Safety',    group: 'defense', required: true },
];

export const MLB_OFFENSE_ROSTER: RosterSlotTemplate[] = [
  { id: 'c_mlb', position: 'C_MLB', label: 'Catcher',             group: 'offense', required: true },
  { id: '1b',    position: '1B',    label: 'First Base',           group: 'offense', required: true },
  { id: '2b',    position: '2B',    label: 'Second Base',          group: 'offense', required: true },
  { id: '3b',    position: '3B',    label: 'Third Base',           group: 'offense', required: true },
  { id: 'ss',    position: 'SS',    label: 'Shortstop',            group: 'offense', required: true },
  { id: 'lf',    position: 'LF',    label: 'Left Field',           group: 'offense', required: true },
  { id: 'cf',    position: 'CF',    label: 'Center Field',         group: 'offense', required: true },
  { id: 'rf',    position: 'RF',    label: 'Right Field',          group: 'offense', required: true },
  { id: 'dh',    position: 'DH',    label: 'Designated Hitter',   group: 'offense', required: true },
];

export const MLB_PITCHING_ROSTER: RosterSlotTemplate[] = [
  { id: 'sp1', position: 'SP', label: 'Starting Pitcher 1', group: 'pitching', required: true },
  { id: 'sp2', position: 'SP', label: 'Starting Pitcher 2', group: 'pitching', required: true },
  { id: 'cl',  position: 'CL', label: 'Closer',             group: 'pitching', required: true },
  { id: 'rp',  position: 'RP', label: 'Relief Pitcher',     group: 'pitching', required: true },
];

export const NHL_OFFENSE_ROSTER: RosterSlotTemplate[] = [
  { id: 'lw1', position: 'LW',    label: 'Left Wing',  group: 'offense', required: true },
  { id: 'c1',  position: 'C_NHL', label: 'Center',     group: 'offense', required: true },
  { id: 'rw1', position: 'RW',    label: 'Right Wing', group: 'offense', required: true },
];

export const NHL_DEFENSE_ROSTER: RosterSlotTemplate[] = [
  { id: 'd1', position: 'D', label: 'Defenseman 1', group: 'defense', required: true },
  { id: 'd2', position: 'D', label: 'Defenseman 2', group: 'defense', required: true },
  { id: 'g', position: 'G_NHL', label: 'Goaltender', group: 'goalie', required: true },
];

export const SOCCER_ROSTER: RosterSlotTemplate[] = [
  { id: 'gk',   position: 'GK',   label: 'Goalkeeper',    group: 'goalie',  required: true },
  { id: 'rb_s', position: 'RB_S', label: 'Right Back',    group: 'defense', required: true },
  { id: 'cb1',  position: 'CB_S', label: 'Centre Back',   group: 'defense', required: true },
  { id: 'cb2',  position: 'CB_S', label: 'Centre Back 2', group: 'defense', required: true },
  { id: 'lb_s', position: 'LB_S', label: 'Left Back',     group: 'defense', required: true },
  { id: 'cdm',  position: 'CDM',  label: 'Def. Mid',      group: 'defense', required: true },
  { id: 'cm1',  position: 'CM_S', label: 'Central Mid',   group: 'offense', required: true },
  { id: 'cam',  position: 'CAM',  label: 'Attacking Mid', group: 'offense', required: true },
  { id: 'rw_s', position: 'RW_S', label: 'Right Wing',    group: 'offense', required: true },
  { id: 'st',   position: 'ST',   label: 'Striker',       group: 'offense', required: true },
  { id: 'lw_s', position: 'LW_S', label: 'Left Wing',     group: 'offense', required: true },
];

export function getRosterTemplates(sport: Sport, mode: DraftMode): RosterSlotTemplate[] {
  switch (sport) {
    case 'nba':
      return NBA_ROSTER;
    case 'nfl':
      if (mode === 'offense') return NFL_OFFENSE_ROSTER;
      if (mode === 'defense') return NFL_DEFENSE_ROSTER;
      return [...NFL_OFFENSE_ROSTER, ...NFL_DEFENSE_ROSTER];
    case 'mlb':
      if (mode === 'offense') return MLB_OFFENSE_ROSTER;
      if (mode === 'defense') return MLB_PITCHING_ROSTER;
      return [...MLB_OFFENSE_ROSTER, ...MLB_PITCHING_ROSTER];
    case 'nhl':
      if (mode === 'offense') return NHL_OFFENSE_ROSTER;
      if (mode === 'defense') return NHL_DEFENSE_ROSTER;
      return [...NHL_OFFENSE_ROSTER, ...NHL_DEFENSE_ROSTER];
    case 'epl':
    case 'wcup':
      return SOCCER_ROSTER;
  }
}

// ─── GSPR Tier Labels ────────────────────────────────────────────────────────

export const GSPR_TIERS = [
  { min: 950, label: 'GOD SQUAD', color: '#ff4444', glow: 'rgba(255,68,68,0.5)' },
  { min: 850, label: 'LEGENDARY', color: '#ffd700', glow: 'rgba(255,215,0,0.4)' },
  { min: 700, label: 'GREAT', color: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
  { min: 500, label: 'GOOD', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { min: 0, label: 'AVERAGE', color: '#6b7280', glow: 'rgba(107,114,128,0.2)' },
];

export function getGsprTier(gspr: number) {
  return GSPR_TIERS.find(t => gspr >= t.min) ?? GSPR_TIERS[GSPR_TIERS.length - 1];
}

// ─── Team-specific era generation ────────────────────────────────────────────
// Each team gets 5-year windows from their founding (or sport minimum) to 2024.
// Era ID format: `${sport}-${teamId}-${startYear}`

const SPORT_ERA_START: Record<Sport, number> = { nba: 1970, nfl: 1970, mlb: 1920, nhl: 1970, epl: 1992, wcup: 1970 };

// Founding years for teams established AFTER their sport's era start
const TEAM_FOUNDED: Partial<Record<string, number>> = {
  // NBA
  'nba-4': 1988, 'nba-7': 1980, 'nba-15': 1995, 'nba-16': 1988,
  'nba-18': 1989, 'nba-19': 2002, 'nba-22': 1989, 'nba-28': 1995,
  // NFL
  'nfl-1': 1966, 'nfl-29': 1995, 'nfl-33': 1996, 'nfl-34': 2002, 'nfl-30': 1995,
  // MLB
  'mlb-109': 1998, 'mlb-115': 1993, 'mlb-117': 1962, 'mlb-120': 1969,
  'mlb-121': 1962, 'mlb-139': 1998, 'mlb-140': 1972, 'mlb-141': 1977,
  'mlb-146': 1993, 'mlb-158': 1969,
  // NHL
  'nhl-CBJ': 2000, 'nhl-FLA': 1993, 'nhl-MIN': 2000, 'nhl-NSH': 1998,
  'nhl-SEA': 2021, 'nhl-SJS': 1991, 'nhl-TBL': 1992, 'nhl-VGK': 2017,
  'nhl-WPG': 1999, 'nhl-OTT': 1992,
};

// Hardcoded notable era info — key: `${sport}-${teamId}-${startYear}`
const ERA_DATA: Record<string, { name: string; description: string }> = {
  // ── NBA Lakers (14) ───────────────────────────────────────────────────────
  'nba-14-1980': { name: 'Showtime I', description: "Magic Johnson's no-look passes ignite Showtime; two titles in five years with Kareem" },
  'nba-14-1985': { name: 'Showtime II', description: "Back-to-back titles cap the Showtime era; Kareem and Magic are unstoppable together" },
  'nba-14-1999': { name: 'Shaq & Kobe', description: "Shaquille O'Neal and Kobe Bryant rip off three straight championships" },
  'nba-14-2009': { name: 'Kobe\'s Rings', description: "Kobe Bryant wins two titles without Shaq, silencing every doubter" },
  'nba-14-2019': { name: 'LeBron\'s Lakers', description: "LeBron James brings a title back to Los Angeles in a bubble championship" },
  // ── NBA Celtics (2) ───────────────────────────────────────────────────────
  'nba-2-1980': { name: 'Bird Era', description: "Larry Bird, Kevin McHale, and Robert Parish deliver three championships" },
  'nba-2-2007': { name: 'Big Three Revival', description: "Paul Pierce, Kevin Garnett, and Ray Allen assemble to end the drought" },
  'nba-2-2020': { name: 'Tatum & Brown', description: "Jayson Tatum and Jaylen Brown build toward the franchise's 18th banner" },
  // ── NBA Bulls (5) ─────────────────────────────────────────────────────────
  'nba-5-1990': { name: 'First Three-Peat', description: "Michael Jordan and Scottie Pippen win three straight titles with the Triangle Offense" },
  'nba-5-1995': { name: 'Second Three-Peat', description: "Jordan returns from baseball, Dennis Rodman joins, and Chicago wins three more rings" },
  // ── NBA Spurs (27) ────────────────────────────────────────────────────────
  'nba-27-2000': { name: 'Duncan\'s Dynasty', description: "Tim Duncan and David Robinson win the title in Robinson's farewell season" },
  'nba-27-2004': { name: 'Popovich\'s Best', description: "Parker, Ginobili, and Duncan at their peak win two more rings" },
  // ── NBA Heat (16) ─────────────────────────────────────────────────────────
  'nba-16-2005': { name: 'D-Wade & Shaq', description: "Dwyane Wade and Shaquille O'Neal deliver Miami's first NBA title" },
  'nba-16-2010': { name: 'LeBron\'s Decision', description: "The Big Three — LeBron, Wade, and Bosh — win back-to-back championships" },
  // ── NBA Warriors (10) ─────────────────────────────────────────────────────
  'nba-10-2014': { name: 'Splash Brothers', description: "Curry and Thompson light up the league; record 73-win season and three rings in four years" },
  'nba-10-2019': { name: 'Durant Era', description: "Kevin Durant joins the dynasty; back-to-back before Klay injury ends the run" },
  // ── NBA Pistons (9) ───────────────────────────────────────────────────────
  'nba-9-1988': { name: 'Bad Boys', description: "Isiah Thomas, Bill Laimbeer, and the Bad Boys rough up the league; two championships" },
  'nba-9-2003': { name: 'Goin\' to Work', description: "Chauncey Billups leads a teamwork masterclass to a shocking 2004 championship" },
  // ── NBA 76ers (23) ────────────────────────────────────────────────────────
  'nba-23-1982': { name: 'Dr. J & Moses', description: "Moses Malone joins Dr. J and declares 'Fo, Fo, Fo'; delivers the title in dominant fashion" },
  // ── NBA Rockets (11) ──────────────────────────────────────────────────────
  'nba-11-1993': { name: 'Hakeem\'s Rockets', description: "Hakeem Olajuwon's Dream Shake destroys defenses; back-to-back titles" },
  // ── NBA Suns (24) ─────────────────────────────────────────────────────────
  'nba-24-2004': { name: 'Seven Seconds or Less', description: "Steve Nash's two MVPs power the most exciting offense in basketball" },
  // ── NBA Jazz (29) ─────────────────────────────────────────────────────────
  'nba-29-1995': { name: 'Stockton & Malone', description: "The pick-and-roll duo reaches back-to-back Finals; the best team never to win it" },
  // ── NBA Cavaliers (6) ─────────────────────────────────────────────────────
  'nba-6-2015': { name: 'LeBron Comes Home', description: "LeBron returns to Cleveland and delivers the city's first major sports title in 52 years" },
  // ── NBA Bucks (17) ────────────────────────────────────────────────────────
  'nba-17-2018': { name: 'Greek Freak', description: "Giannis Antetokounmpo wins two MVPs and a title in an all-time Bucks revival" },
  // ── NBA Raptors (28) ──────────────────────────────────────────────────────
  'nba-28-2018': { name: 'We The North', description: "Kawhi Leonard's iconic shot and Finals MVP give Canada its only NBA championship" },
  // ── NBA Nuggets (8) ───────────────────────────────────────────────────────
  'nba-8-2019': { name: 'Jokic Era', description: "Nikola Jokic wins three MVPs and leads Denver to its first championship in franchise history" },
  // ── NBA Trail Blazers (25) ────────────────────────────────────────────────
  'nba-25-1989': { name: 'Drexler\'s Era', description: "Clyde the Glide leads Portland to two Finals appearances; the Blazer roar is at its loudest" },
  // ── NBA Knicks (20) ───────────────────────────────────────────────────────
  'nba-20-1991': { name: 'Ewing\'s Knicks', description: "Patrick Ewing and Riley's defensive Knicks reach the Finals; New York's last great team" },

  // ── NFL Steelers (23) ─────────────────────────────────────────────────────
  'nfl-23-1974': { name: 'Steel Curtain I', description: "Mean Joe Greene and the Curtain defense anchor two Super Bowl wins in the dynasty's birth" },
  'nfl-23-1975': { name: 'Steel Curtain Peak', description: "Bradshaw, Harris, Swann, and the defense reach four Super Bowls in six years" },
  'nfl-23-2004': { name: 'Bus Rides Out', description: "Jerome Bettis' farewell tour ends with a Super Bowl win; Big Ben arrives" },
  'nfl-23-2007': { name: 'Harrison\'s Defense', description: "James Harrison's 100-yard INT return highlights the last great Steelers Super Bowl run" },
  // ── NFL 49ers (25) ────────────────────────────────────────────────────────
  'nfl-25-1980': { name: 'Montana Arrives', description: "Joe Montana and Bill Walsh install the West Coast Offense; two titles in five years" },
  'nfl-25-1985': { name: 'Rice Joins Montana', description: "Jerry Rice arrives; Montana throws for a then-record five Super Bowl TDs" },
  'nfl-25-2011': { name: 'Harbaugh Era', description: "Jim Harbaugh's 49ers return to dominance with Kaepernick; three straight NFC title games" },
  'nfl-25-2019': { name: 'Shanahan & Kittle', description: "Kyle Shanahan's scheme with Kittle, Deebo, and Purdy makes SF an NFC powerhouse again" },
  // ── NFL Cowboys (6) ───────────────────────────────────────────────────────
  'nfl-6-1991': { name: 'Triplets Dynasty', description: "Aikman, Emmitt, and Irvin win three rings in four years; America's Team at its peak" },
  'nfl-6-2006': { name: 'Romo Era', description: "Tony Romo brings flair but playoff heartbreak; Dez Bryant's 'incomplete' defines the era" },
  // ── NFL Patriots (17) ─────────────────────────────────────────────────────
  'nfl-17-2001': { name: 'Brady Dynasty I', description: "Brady stuns the Greatest Show on Turf; three rings in four years on slim margins" },
  'nfl-17-2006': { name: 'Brady Dynasty II', description: "The Moss-to-Brady 50-TD season and a 16-0 run before the Giants upset" },
  'nfl-17-2011': { name: 'Brady Dynasty III', description: "Gronkowski and Edelman power two more Super Bowls for the greatest dynasty ever" },
  'nfl-17-2016': { name: '28-3', description: "Brady's greatest comeback from 28-3 down in the Super Bowl; dynasty's crown jewel" },
  // ── NFL Packers (9) ───────────────────────────────────────────────────────
  'nfl-9-1995': { name: 'Favre\'s Title', description: "Brett Favre wins three straight MVPs and a Super Bowl; Green Bay is elite again" },
  'nfl-9-2009': { name: 'Rodgers Takes Over', description: "Aaron Rodgers wins MVP and a dominant Super Bowl; cements himself as the next legend" },
  // ── NFL Giants (19) ───────────────────────────────────────────────────────
  'nfl-19-1985': { name: 'LT\'s Giants', description: "Lawrence Taylor is the most terrifying player alive; two Super Bowls with Simms and Parcells" },
  'nfl-19-2006': { name: 'Eli\'s Upsets', description: "Eli Manning's two improbable Super Bowl wins over the undefeated Patriots" },
  // ── NFL Bears (3) ─────────────────────────────────────────────────────────
  'nfl-3-1984': { name: '85 Bears', description: "The '85 Bears are the greatest defense ever — 46 Bear Defense, Fridge, McMahon, Sweetness" },
  // ── NFL Broncos (7) ───────────────────────────────────────────────────────
  'nfl-7-1996': { name: 'Elway\'s Rings', description: "John Elway finally wins back-to-back Super Bowls in his final two seasons" },
  'nfl-7-2011': { name: 'Peyton\'s Broncos', description: "Peyton Manning shatters every passing record; a Super Bowl win to cap the dynasty" },
  // ── NFL Rams (14) ─────────────────────────────────────────────────────────
  'nfl-14-1999': { name: 'Greatest Show on Turf', description: "Kurt Warner, Marshall Faulk, and the GSOT break every offensive record in two Super Bowls" },
  'nfl-14-2017': { name: 'McVay Era', description: "Sean McVay's offense with Goff and Gurley shocks the league; a Super Bowl win in '21" },
  // ── NFL Chiefs (12) ───────────────────────────────────────────────────────
  'nfl-12-2018': { name: 'Mahomes Dynasty', description: "Patrick Mahomes wins three Super Bowls by 28 with Kelce; the new millennium dynasty" },
  // ── NFL Seahawks (26) ─────────────────────────────────────────────────────
  'nfl-26-2012': { name: 'Legion of Boom', description: "Sherman, Chancellor, Thomas, and Bennett field the best defense of the decade; a Super Bowl blowout" },
  // ── NFL Ravens (33) ───────────────────────────────────────────────────────
  'nfl-33-2000': { name: 'Ray Lewis Defense', description: "Ray Lewis and the Ravens defense allow the fewest points ever; dominant Super Bowl win" },
  'nfl-33-2011': { name: 'Flacco\'s Run', description: "Joe Flacco goes ice-cold through the playoffs and wins Super Bowl MVP" },
  // ── NFL Dolphins (15) ─────────────────────────────────────────────────────
  'nfl-15-1971': { name: 'Shula\'s Perfect Season', description: "Don Shula's 1972 Dolphins go 17-0; the only perfect season in NFL history" },
  // ── NFL Bills (2) ─────────────────────────────────────────────────────────
  'nfl-2-1990': { name: 'K-Gun Bills', description: "Jim Kelly's no-huddle K-Gun offense reaches four straight Super Bowls — the cruelest dynasty" },
  // ── NFL Raiders (13) ──────────────────────────────────────────────────────
  'nfl-13-1975': { name: 'Stabler\'s Raiders', description: "Ken Stabler and the Raiders finally win it all; the most feared team in the AFC" },
  // ── NFL Eagles (21) ───────────────────────────────────────────────────────
  'nfl-21-2017': { name: 'Foles\' Miracle', description: "Nick Foles catches a Super Bowl touchdown on 4th down and wins MVP over Brady" },
  // ── NFL Buccaneers (27) ───────────────────────────────────────────────────
  'nfl-27-2002': { name: 'Dungy\'s Defense', description: "The Tampa-2 defense terrorizes the league; Gruden inherits and wins the Super Bowl" },
  'nfl-27-2019': { name: 'Brady\'s Tampa', description: "Tom Brady brings another Super Bowl to Tampa; Gronk comes out of retirement" },
  // ── NFL Colts (11) ────────────────────────────────────────────────────────
  'nfl-11-2001': { name: 'Peyton\'s Colts', description: "Peyton Manning posts historic numbers for years; the Super Bowl win silences doubters" },
  // ── NFL Vikings (16) ──────────────────────────────────────────────────────
  'nfl-16-1973': { name: 'Purple People Eaters', description: "Fran Tarkenton and the Purple People Eaters defense reach four Super Bowls without a win" },

  // ── MLB Yankees (147) ─────────────────────────────────────────────────────
  'mlb-147-1925': { name: 'Murderers\' Row', description: "Babe Ruth hits 60 home runs; the '27 Yankees are still considered the greatest team ever assembled" },
  'mlb-147-1935': { name: 'DiMaggio Arrives', description: "Joe DiMaggio's 56-game hitting streak and four more World Series titles define this dynasty" },
  'mlb-147-1949': { name: 'Stengel\'s Yankees', description: "Casey Stengel wins five straight World Series; Mantle takes the torch from DiMaggio" },
  'mlb-147-1955': { name: 'Mantle\'s Peak', description: "Mickey Mantle wins his Triple Crown; the Yankees are in the World Series every year" },
  'mlb-147-1975': { name: 'Bronx Zoo', description: "Reggie Jackson's three HRs in one Series inning; the Bronx Zoo wins back-to-back" },
  'mlb-147-1995': { name: 'Core Four', description: "Jeter, Rivera, Pettitte, and Posada form the Core Four; four titles in five years" },
  'mlb-147-2000': { name: 'Jeter Dynasty', description: "Derek Jeter's flip play and Mr. November; the last years of true Yankees dominance" },
  // ── MLB Red Sox (111) ─────────────────────────────────────────────────────
  'mlb-111-2004': { name: 'The Reverse Curse', description: "Down 3-0 to the Yankees, Boston wins four straight — and then sweeps the World Series" },
  'mlb-111-2017': { name: 'Sale Era', description: "Chris Sale, Mookie Betts, and a dominant lineup win 108 games and the title" },
  // ── MLB Cubs (112) ────────────────────────────────────────────────────────
  'mlb-112-2015': { name: 'Breaking the Curse', description: "Kris Bryant, Anthony Rizzo, and the Baby Bears end a 108-year championship drought" },
  // ── MLB Reds (113) ────────────────────────────────────────────────────────
  'mlb-113-1970': { name: 'Big Red Machine', description: "Pete Rose, Johnny Bench, Joe Morgan, and Tony Perez assemble the greatest lineup in NL history" },
  'mlb-113-1975': { name: 'Back-to-Back Reds', description: "Morgan wins back-to-back MVPs; Cincinnati wins consecutive World Series" },
  // ── MLB Dodgers (119) ─────────────────────────────────────────────────────
  'mlb-119-1960': { name: 'Koufax Dominates', description: "Sandy Koufax is the most unhittable pitcher in history; three Cy Youngs and two no-hitters" },
  'mlb-119-1974': { name: 'Garvey\'s Dodgers', description: "Steve Garvey, Cey, Russell, and Lopes form one of baseball's greatest infields" },
  'mlb-119-2015': { name: 'Kershaw Era', description: "Clayton Kershaw's three Cy Youngs; the Dodgers return to their place atop the NL" },
  // ── MLB A's (133) ─────────────────────────────────────────────────────────
  'mlb-133-1970': { name: 'Finley\'s Mustache Gang', description: "Reggie Jackson, Catfish Hunter, and the Mustache Gang win three straight World Series" },
  'mlb-133-1988': { name: 'Bash Brothers', description: "McGwire, Canseco, and Rickey Henderson power Oakland to three straight World Series" },
  // ── MLB Cardinals (138) ───────────────────────────────────────────────────
  'mlb-138-1964': { name: 'Gibson\'s Cardinals', description: "Bob Gibson's complete-game dominance leads St. Louis through back-to-back World Series" },
  'mlb-138-2004': { name: 'Pujols Machine', description: "Albert Pujols, Scott Rolen, and Jim Edmonds form one of baseball's greatest trios" },
  'mlb-138-2010': { name: 'Waino & Carpenter', description: "Wainwright, Holliday, and Carpenter keep the Cardinals a perennial October threat" },
  // ── MLB Giants (137) ──────────────────────────────────────────────────────
  'mlb-137-1999': { name: 'Bonds Era', description: "Barry Bonds shatters the single-season HR record; San Francisco becomes a NL powerhouse" },
  'mlb-137-2010': { name: 'Even Years Dynasty', description: "Lincecum, Cain, Posey, and Bumgarner win three World Series in five even-numbered years" },
  // ── MLB Astros (117) ──────────────────────────────────────────────────────
  'mlb-117-2017': { name: 'Sign-Stealing Era', description: "Altuve, Bregman, and Verlander win the title; the dynasty is later overshadowed by scandal" },
  // ── MLB Braves (144) ──────────────────────────────────────────────────────
  'mlb-144-1990': { name: 'Maddux, Glavine, Smoltz', description: "Three Hall of Fame starters anchor 14 straight division titles; one World Series ring" },

  // ── NHL Oilers (EDM) ──────────────────────────────────────────────────────
  'nhl-EDM-1983': { name: 'Gretzky Dynasty', description: "Wayne Gretzky, Mark Messier, and Paul Coffey win four Cups; the most dominant team in hockey history" },
  'nhl-EDM-1988': { name: 'After Gretzky', description: "Gretzky is traded to LA; Messier leads Edmonton to a fifth Cup without the Great One" },
  // ── NHL Penguins (PIT) ────────────────────────────────────────────────────
  'nhl-PIT-1990': { name: 'Lemieux\'s Pens', description: "Mario Lemieux and Jaromir Jagr win back-to-back Stanley Cups; Super Mario at his absolute peak" },
  'nhl-PIT-2015': { name: 'Crosby\'s Back-to-Back', description: "Sidney Crosby wins back-to-back Cups and Conn Smythe trophies; the franchise's second dynasty" },
  // ── NHL Red Wings (DET) ───────────────────────────────────────────────────
  'nhl-DET-1995': { name: 'Russian Five', description: "Yzerman, Fedorov, Larionov, Konstantinov and Shanahan win two of four Cups" },
  'nhl-DET-2000': { name: 'Hull & Yzerman', description: "Brett Hull joins Yzerman; Detroit wins the Cup with one of hockey's greatest rosters" },
  // ── NHL Devils (NJD) ──────────────────────────────────────────────────────
  'nhl-NJD-1995': { name: 'Brodeur\'s Trap', description: "Martin Brodeur invents modern goaltending; the trap defense suffocates the league for a Cup" },
  'nhl-NJD-2000': { name: 'Devils Dynasty', description: "Brodeur, Stevens, and Niedermayer win three Cups in nine years; the most underrated dynasty" },
  // ── NHL Avalanche (COL) ───────────────────────────────────────────────────
  'nhl-COL-1995': { name: 'Roy, Sakic & Forsberg', description: "Patrick Roy arrives from Montreal; Sakic, Forsberg, and Roy win two Cups in Denver" },
  'nhl-COL-2019': { name: 'MacKinnon Peaks', description: "Nathan MacKinnon's MVP seasons culminate in Colorado's third Stanley Cup championship" },
  // ── NHL Lightning (TBL) ───────────────────────────────────────────────────
  'nhl-TBL-2003': { name: 'Lecavalier\'s Cup', description: "Vincent Lecavalier and Brad Richards win the Lightning's first Cup in dominant fashion" },
  'nhl-TBL-2019': { name: 'Kucherov Dynasty', description: "Kucherov, Point, Hedman, and Vasilevskiy win back-to-back Cups in the league's new dynasty" },
  // ── NHL Bruins (BOS) ──────────────────────────────────────────────────────
  'nhl-BOS-2010': { name: 'Thomas & Chara', description: "Tim Thomas posts the greatest goaltending performance in Cup Final history; 2011 champions" },
  // ── NHL Blackhawks (CHI) ──────────────────────────────────────────────────
  'nhl-CHI-2009': { name: 'Toews & Kane', description: "Toews, Kane, Keith, and Crawford win three Cups in six years; Chicago's greatest dynasty" },
  // ── NHL Kings (LAK) ───────────────────────────────────────────────────────
  'nhl-LAK-2010': { name: 'Quick & Kopitar', description: "Jonathan Quick is unbeatable; Kopitar and Doughty lead the Kings to back-to-back Cups" },
  // ── NHL Rangers (NYR) ─────────────────────────────────────────────────────
  'nhl-NYR-1993': { name: 'Messier\'s Guarantee', description: "Mark Messier guarantees a Game 6 win, delivers, then wins the Cup to end a 54-year drought" },
  // ── NHL Canadiens (MTL) ───────────────────────────────────────────────────
  'nhl-MTL-1975': { name: 'Lafleur\'s Dynasty', description: "Guy Lafleur leads Montreal to four straight Stanley Cups; the last great Canadiens dynasty" },
  // ── NHL Flyers (PHI) ──────────────────────────────────────────────────────
  'nhl-PHI-1973': { name: 'Broad Street Bullies', description: "Clarke, Parent, and the Bullies win back-to-back Cups through intimidation and skill" },
  // ── NHL Capitals (WSH) ────────────────────────────────────────────────────
  'nhl-WSH-2017': { name: 'Ovi\'s Cup', description: "Alexander Ovechkin finally lifts the Stanley Cup; the Great 8 silences every doubter" },
  // ── NHL Blues (STL) ───────────────────────────────────────────────────────
  'nhl-STL-2018': { name: 'Gloria!', description: "Last in the league in January, St. Louis rallies behind 'Gloria' to win the franchise's first Cup" },
};

export function generateTeamEras(team: HistoricalTeam): Era[] {
  const sportMin = SPORT_ERA_START[team.sport];
  const founded = TEAM_FOUNDED[`${team.sport}-${team.id}`] ?? sportMin;
  const firstEraStart = Math.max(sportMin, Math.floor(founded / 5) * 5);
  const eras: Era[] = [];

  for (let start = firstEraStart; start <= 2020; start += 5) {
    const end = start + 4;
    const id = `${team.sport}-${team.id}-${start}`;
    const custom = ERA_DATA[id];
    eras.push({
      id,
      teamId: team.id,
      sport: team.sport,
      startYear: start,
      endYear: end,
      name: custom?.name ?? `${start}–${end}`,
      description: custom?.description ?? `${team.city} ${team.name} during the ${start}–${end} seasons`,
    });
  }

  return eras;
}
