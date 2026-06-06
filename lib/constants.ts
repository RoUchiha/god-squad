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
    gamesInSeason: 17,
    hasModes: true,
    tagline: 'Can your squad go 17-0?',
  },
  mlb: {
    label: 'MLB',
    emoji: '⚾',
    primaryColor: '#002D72',
    accentColor: '#E31837',
    bgColor: '#000A1A',
    gamesInSeason: 162,
    hasModes: true,
    tagline: 'Can your squad go 162-0?',
  },
  nhl: {
    label: 'NHL',
    emoji: '🏒',
    primaryColor: '#003087',
    accentColor: '#FCB514',
    bgColor: '#001020',
    gamesInSeason: 82,
    hasModes: true,
    tagline: 'Can your squad go 82-0?',
  },
};

// ─── Roster Templates ────────────────────────────────────────────────────────

export const NBA_ROSTER: RosterSlotTemplate[] = [
  { id: 'pg', position: 'PG', label: 'Point Guard', group: 'offense', required: true },
  { id: 'sg', position: 'SG', label: 'Shooting Guard', group: 'offense', required: true },
  { id: 'sf', position: 'SF', label: 'Small Forward', group: 'offense', required: true },
  { id: 'pf', position: 'PF', label: 'Power Forward', group: 'offense', required: true },
  { id: 'c', position: 'C', label: 'Center', group: 'offense', required: true },
  { id: 'b1', position: ['PG', 'SG'], label: 'Bench (Guard)', group: 'offense', required: false },
  { id: 'b2', position: ['SF', 'PF'], label: 'Bench (Forward)', group: 'offense', required: false },
  { id: 'b3', position: ['PF', 'C'], label: 'Bench (Big)', group: 'offense', required: false },
];

export const NFL_OFFENSE_ROSTER: RosterSlotTemplate[] = [
  { id: 'qb', position: 'QB', label: 'Quarterback', group: 'offense', required: true },
  { id: 'rb', position: 'RB', label: 'Running Back', group: 'offense', required: true },
  { id: 'wr1', position: 'WR', label: 'Wide Receiver 1', group: 'offense', required: true },
  { id: 'wr2', position: 'WR', label: 'Wide Receiver 2', group: 'offense', required: true },
  { id: 'wr3', position: 'WR', label: 'Wide Receiver 3', group: 'offense', required: false },
  { id: 'te', position: 'TE', label: 'Tight End', group: 'offense', required: true },
  { id: 'k', position: 'K', label: 'Kicker', group: 'offense', required: false },
];

export const NFL_DEFENSE_ROSTER: RosterSlotTemplate[] = [
  { id: 'de1', position: 'DE', label: 'Defensive End 1', group: 'defense', required: true },
  { id: 'de2', position: 'DE', label: 'Defensive End 2', group: 'defense', required: true },
  { id: 'dt', position: 'DT', label: 'Defensive Tackle', group: 'defense', required: true },
  { id: 'lb1', position: 'LB', label: 'Linebacker 1', group: 'defense', required: true },
  { id: 'lb2', position: 'LB', label: 'Linebacker 2', group: 'defense', required: true },
  { id: 'cb1', position: 'CB', label: 'Cornerback 1', group: 'defense', required: true },
  { id: 'cb2', position: 'CB', label: 'Cornerback 2', group: 'defense', required: true },
  { id: 's', position: 'S', label: 'Safety', group: 'defense', required: true },
];

export const MLB_OFFENSE_ROSTER: RosterSlotTemplate[] = [
  { id: 'c_mlb', position: 'C_MLB', label: 'Catcher', group: 'offense', required: true },
  { id: '1b', position: '1B', label: 'First Base', group: 'offense', required: true },
  { id: '2b', position: '2B', label: 'Second Base', group: 'offense', required: true },
  { id: '3b', position: '3B', label: 'Third Base', group: 'offense', required: true },
  { id: 'ss', position: 'SS', label: 'Shortstop', group: 'offense', required: true },
  { id: 'lf', position: 'LF', label: 'Left Field', group: 'offense', required: true },
  { id: 'cf', position: 'CF', label: 'Center Field', group: 'offense', required: true },
  { id: 'rf', position: 'RF', label: 'Right Field', group: 'offense', required: true },
  { id: 'dh', position: 'DH', label: 'Designated Hitter', group: 'offense', required: false },
];

export const MLB_PITCHING_ROSTER: RosterSlotTemplate[] = [
  { id: 'sp1', position: 'SP', label: 'Starting Pitcher 1', group: 'pitching', required: true },
  { id: 'sp2', position: 'SP', label: 'Starting Pitcher 2', group: 'pitching', required: true },
  { id: 'cl', position: 'CL', label: 'Closer', group: 'pitching', required: true },
  { id: 'rp', position: 'RP', label: 'Relief Pitcher', group: 'pitching', required: false },
];

export const NHL_OFFENSE_ROSTER: RosterSlotTemplate[] = [
  { id: 'lw1', position: 'LW', label: 'Left Wing 1', group: 'offense', required: true },
  { id: 'c1', position: 'C_NHL', label: 'Center 1', group: 'offense', required: true },
  { id: 'rw1', position: 'RW', label: 'Right Wing 1', group: 'offense', required: true },
  { id: 'lw2', position: 'LW', label: 'Left Wing 2', group: 'offense', required: false },
  { id: 'c2', position: 'C_NHL', label: 'Center 2', group: 'offense', required: false },
  { id: 'rw2', position: 'RW', label: 'Right Wing 2', group: 'offense', required: false },
];

export const NHL_DEFENSE_ROSTER: RosterSlotTemplate[] = [
  { id: 'd1', position: 'D', label: 'Defenseman 1', group: 'defense', required: true },
  { id: 'd2', position: 'D', label: 'Defenseman 2', group: 'defense', required: true },
  { id: 'g', position: 'G_NHL', label: 'Goaltender', group: 'goalie', required: true },
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

// ─── NBA Eras ────────────────────────────────────────────────────────────────

export const NBA_ERAS: Era[] = [
  { id: 'nba-showtime', name: 'Showtime Era', startYear: 1980, endYear: 1989, sport: 'nba', description: 'Fast-break basketball, Magic vs Bird rivalry' },
  { id: 'nba-jordan', name: 'Jordan Dynasty', startYear: 1990, endYear: 1998, sport: 'nba', description: 'His Airness dominates; 6 championships in 8 years' },
  { id: 'nba-shaq-kobe', name: 'Shaq & Kobe Era', startYear: 1999, endYear: 2006, sport: 'nba', description: 'Lakers three-peat; post-Jordan power vacuum' },
  { id: 'nba-lebron', name: 'LeBron Rises', startYear: 2003, endYear: 2012, sport: 'nba', description: 'LeBron, D-Wade, Melo usher in new generation' },
  { id: 'nba-warriors', name: 'Splash Brothers Era', startYear: 2014, endYear: 2019, sport: 'nba', description: 'Golden State revolutionizes 3-point shooting' },
  { id: 'nba-modern', name: 'Modern NBA', startYear: 2019, endYear: 2024, sport: 'nba', description: 'Analytics-driven superteams and positionless play' },
];

export const NFL_ERAS: Era[] = [
  { id: 'nfl-steel', name: 'Steel Curtain Era', startYear: 1974, endYear: 1979, sport: 'nfl', description: 'Pittsburgh Steelers dynasty, dominant defenses' },
  { id: 'nfl-montana', name: 'Montana 49ers Era', startYear: 1981, endYear: 1989, sport: 'nfl', description: 'West Coast Offense, 4 Super Bowl wins' },
  { id: 'nfl-cowboys', name: 'Dallas Dynasty', startYear: 1991, endYear: 1998, sport: 'nfl', description: 'Troy Aikman, Emmitt Smith, Michael Irvin, 3 rings' },
  { id: 'nfl-pats-early', name: 'Belichick Dynasty I', startYear: 2001, endYear: 2008, sport: 'nfl', description: 'Brady, Belichick begin the dynasty' },
  { id: 'nfl-pats-late', name: 'Belichick Dynasty II', startYear: 2009, endYear: 2018, sport: 'nfl', description: 'Brady continues winning; Gronk era' },
  { id: 'nfl-modern', name: 'Mahomes Era', startYear: 2018, endYear: 2024, sport: 'nfl', description: 'Kansas City Chiefs dynasty, the new generation' },
];

export const MLB_ERAS: Era[] = [
  { id: 'mlb-yankees27', name: 'Murderers Row', startYear: 1927, endYear: 1932, sport: 'mlb', description: 'Ruth, Gehrig, and the greatest offense ever assembled' },
  { id: 'mlb-stengel', name: 'Stengel Yankees', startYear: 1949, endYear: 1960, sport: 'mlb', description: '5 consecutive World Series, DiMaggio to Mantle' },
  { id: 'mlb-bigred', name: 'Big Red Machine', startYear: 1970, endYear: 1979, sport: 'mlb', description: "Cincinnati's Rose, Bench, Morgan, and Perez dominate" },
  { id: 'mlb-oaklandas', name: "Oakland A's Dynasty", startYear: 1988, endYear: 1993, sport: 'mlb', description: 'Bash Brothers, Rickey Henderson, 3-peat' },
  { id: 'mlb-yankees96', name: 'Core Four Yankees', startYear: 1996, endYear: 2003, sport: 'mlb', description: 'Jeter, Rivera, Pettitte, Posada dynasty' },
  { id: 'mlb-modern', name: 'Statcast Era', startYear: 2017, endYear: 2024, sport: 'mlb', description: 'Launch angle revolution, analytics-driven baseball' },
];

export const NHL_ERAS: Era[] = [
  { id: 'nhl-oilers', name: 'Gretzky Oilers', startYear: 1983, endYear: 1990, sport: 'nhl', description: 'The Great One leads 4 Stanley Cup championships' },
  { id: 'nhl-penguins91', name: 'Lemieux Penguins', startYear: 1990, endYear: 1997, sport: 'nhl', description: 'Super Mario and Jaromir Jagr back-to-back cups' },
  { id: 'nhl-nworder', name: 'New World Order', startYear: 1993, endYear: 2001, sport: 'nhl', description: 'Red Wings, Avalanche, Devils dominate' },
  { id: 'nhl-post-lockout', name: 'Post-Lockout Speed', startYear: 2005, endYear: 2012, sport: 'nhl', description: 'New rules open up the game; Crosby-Ovechkin era begins' },
  { id: 'nhl-pens-dynasty', name: 'Crosby Penguins', startYear: 2016, endYear: 2021, sport: 'nhl', description: 'Pittsburgh back-to-back cups, Crosby at peak' },
  { id: 'nhl-modern', name: 'Matthews Era', startYear: 2019, endYear: 2024, sport: 'nhl', description: 'Lightning dynasty, Avalanche Cup, new superstars emerge' },
];

export const ERAS_BY_SPORT: Record<Sport, Era[]> = {
  nba: NBA_ERAS,
  nfl: NFL_ERAS,
  mlb: MLB_ERAS,
  nhl: NHL_ERAS,
};
