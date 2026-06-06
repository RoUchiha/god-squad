import type { Sport, SeasonResults, TeamPower, GameResult } from '../types';
import { SPORT_CONFIG } from '../constants';
import { clamp, getAchievement } from '../utils';

// ─── Win Probability ─────────────────────────────────────────────────────────
// Calibrated so going undefeated is:
//   NFL  (17 games):  ~25-30% at max GSPR,  ~8-12% at GSPR 900
//   NBA  (82 games):  ~20-25% at max GSPR,  ~5-10% at GSPR 900
//   NHL  (82 games):  ~18-22% at max GSPR,  ~4-8%  at GSPR 900
//   MLB (162 games):  ~8-12%  at max GSPR,  ~2-4%  at GSPR 900

const WIN_PROB_CONFIG: Record<Sport, { base: number; range: number; power: number }> = {
  nba: { base: 0.620, range: 0.365, power: 1.8 },  // [0.62 → 0.985]
  nfl: { base: 0.580, range: 0.330, power: 1.8 },  // [0.58 → 0.910]
  mlb: { base: 0.560, range: 0.432, power: 1.8 },  // [0.56 → 0.992]
  nhl: { base: 0.600, range: 0.382, power: 1.8 },  // [0.60 → 0.982]
};

export function getBaseWinProbability(gspr: number, sport: Sport): number {
  const { base, range, power } = WIN_PROB_CONFIG[sport];
  const normalized = Math.pow(gspr / 1000, power);
  return clamp(base + range * normalized, 0.05, 0.995);
}

// ─── Opponent tier labels ─────────────────────────────────────────────────────

const OPPONENT_TIERS = [
  { weight: 0.10, label: 'Elite', strengthBonus: 0.12 },
  { weight: 0.20, label: 'Strong', strengthBonus: 0.06 },
  { weight: 0.40, label: 'Average', strengthBonus: 0.0 },
  { weight: 0.20, label: 'Weak', strengthBonus: -0.05 },
  { weight: 0.10, label: 'Poor', strengthBonus: -0.10 },
];

function sampleOpponentTier(rand: number): (typeof OPPONENT_TIERS)[0] {
  let cumulative = 0;
  for (const tier of OPPONENT_TIERS) {
    cumulative += tier.weight;
    if (rand < cumulative) return tier;
  }
  return OPPONENT_TIERS[2];
}

// ─── Season Simulation ────────────────────────────────────────────────────────

export function simulateSeason(
  teamPower: TeamPower,
  sport: Sport
): SeasonResults {
  const totalGames = SPORT_CONFIG[sport].gamesInSeason;
  const baseWinProb = getBaseWinProbability(teamPower.gspr, sport);

  const games: GameResult[] = [];
  let wins = 0;
  let losses = 0;
  let currentStreak = 0;
  let longestStreak = 0;

  for (let g = 1; g <= totalGames; g++) {
    const oppTier = sampleOpponentTier(Math.random());

    // Per-game random variance (hot/cold performance)
    const perfVariance = (Math.random() - 0.5) * 0.08;
    // Opponent plays harder than expected
    const oppVariance = oppTier.strengthBonus + (Math.random() - 0.3) * 0.04;

    const adjustedWinProb = clamp(
      baseWinProb + perfVariance - oppVariance,
      0.05,
      0.995
    );

    const win = Math.random() < adjustedWinProb;
    const scoreDiff = win
      ? Math.round(Math.random() * 20 + 1)
      : -Math.round(Math.random() * 15 + 1);

    if (win) {
      wins++;
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      losses++;
      currentStreak = 0;
    }

    games.push({ gameNumber: g, win, scoreDiff, opponentTier: oppTier.label });
  }

  const isUndefeated = losses === 0;
  const { title: achievement, subtext: achievementSubtext } = getAchievement(wins, losses, sport);

  return {
    sport,
    wins,
    losses,
    totalGames,
    games,
    teamPower,
    isUndefeated,
    longestWinStreak: longestStreak,
    achievement,
    achievementSubtext,
    recordLabel: `${wins}-${losses}`,
  };
}

// ─── Quick undefeated probability estimate (for display) ─────────────────────

export function estimateUndefeatedChance(gspr: number, sport: Sport): number {
  const p = getBaseWinProbability(gspr, sport);
  const games = SPORT_CONFIG[sport].gamesInSeason;
  return Math.pow(p, games) * 100;
}
