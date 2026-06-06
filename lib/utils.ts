import type { Sport } from './types';
import { SPORT_CONFIG } from './constants';

export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function normalizeToRange(
  value: number,
  mean: number,
  stdDev: number,
  targetMin = 0,
  targetMax = 100
): number {
  if (stdDev === 0) return (targetMin + targetMax) / 2;
  const z = (value - mean) / stdDev;
  const normalized = sigmoid(z * 0.8);
  return lerp(targetMin, targetMax, normalized);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatRecord(wins: number, losses: number): string {
  return `${wins}-${losses}`;
}

export function getWinPct(wins: number, games: number): number {
  if (games === 0) return 0;
  return wins / games;
}

export function formatPct(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function sportLabel(sport: Sport): string {
  return SPORT_CONFIG[sport].label;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function seededRandom(seed: number): () => number {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function getAchievement(wins: number, losses: number, sport: Sport): {
  title: string;
  subtext: string;
} {
  const games = SPORT_CONFIG[sport].gamesInSeason;
  const pct = wins / games;

  if (losses === 0) {
    return {
      title: '⚡ GOD SQUAD ACHIEVED',
      subtext: `Went ${wins}-0 — the perfect season. Virtually impossible. You just did it.`,
    };
  }
  if (losses <= 2) {
    return {
      title: '🔥 DYNASTY LEVEL',
      subtext: `${wins}-${losses} — one of the greatest seasons ever recorded.`,
    };
  }
  if (pct >= 0.85) {
    return {
      title: '👑 LEGENDARY SEASON',
      subtext: `${wins}-${losses} — historically great. Hall of Fame caliber.`,
    };
  }
  if (pct >= 0.75) {
    return {
      title: '⭐ ELITE SEASON',
      subtext: `${wins}-${losses} — a dominant campaign. Championship contender.`,
    };
  }
  if (pct >= 0.60) {
    return {
      title: '✅ STRONG SEASON',
      subtext: `${wins}-${losses} — solid record, playoff bound.`,
    };
  }
  if (pct >= 0.50) {
    return {
      title: '📈 WINNING RECORD',
      subtext: `${wins}-${losses} — above .500, but nothing special.`,
    };
  }
  return {
    title: '❌ REBUILDING',
    subtext: `${wins}-${losses} — that's a lottery pick.`,
  };
}
