import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Sport, EraResponse, HistoricalTeam, Era } from '@/lib/types';
import { generateTeamEras } from '@/lib/constants';
import { MLB_TEAMS } from '@/lib/sports/mlb';
import { NHL_TEAMS } from '@/lib/sports/nhl';
import { NBA_TEAMS } from '@/lib/sports/nba';
import { NFL_TEAMS } from '@/lib/sports/nfl';
import { EPL_TEAMS, WCUP_TEAMS, SOCCER_CURATED_ERA_KEYS } from '@/lib/sports/soccer';

const TEAMS_BY_SPORT: Record<Sport, HistoricalTeam[]> = {
  mlb: MLB_TEAMS,
  nhl: NHL_TEAMS,
  nba: NBA_TEAMS,
  nfl: NFL_TEAMS,
  epl: EPL_TEAMS,
  wcup: WCUP_TEAMS,
};

const ParamsSchema = z.object({
  sport: z.enum(['nba', 'nfl', 'mlb', 'nhl', 'epl', 'wcup']),
});

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function parseSoccerCuratedKey(key: string): { teamId: string; eraId: string } | null {
  // key format: "mu-epl-mu-1997"  →  teamId="mu", eraId="epl-mu-1997"
  const dashIdx = key.indexOf('-');
  if (dashIdx === -1) return null;
  return { teamId: key.slice(0, dashIdx), eraId: key.slice(dashIdx + 1) };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { sport: string } }
) {
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid sport. Must be one of: nba, nfl, mlb, nhl, epl, wcup' },
      { status: 400 }
    );
  }

  const sport = parsed.data.sport as Sport;
  const teams = TEAMS_BY_SPORT[sport];

  // Parse exclude list (comma-separated era IDs to skip)
  const { searchParams } = new URL(req.url);
  const excludeRaw = searchParams.get('exclude') ?? '';
  const excludeSet = new Set(
    excludeRaw.split(',').map(s => s.trim()).filter(Boolean)
  );

  if (sport === 'epl' || sport === 'wcup') {
    const shuffled = [...SOCCER_CURATED_ERA_KEYS]
      .filter(k => {
        const p = parseSoccerCuratedKey(k);
        return p && !excludeSet.has(p.eraId);
      })
      .sort(() => Math.random() - 0.5);

    for (const key of shuffled) {
      const p = parseSoccerCuratedKey(key);
      if (!p) continue;
      const team = teams.find(t => t.id === p.teamId);
      if (!team) continue;
      const eras = generateTeamEras(team);
      const era = eras.find(e => e.id === p.eraId);
      if (era) {
        const response: EraResponse = { era, team };
        return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
      }
    }
    // Fallback: ignore exclude if all used
    const team = pickRandom(teams);
    const eras = generateTeamEras(team);
    const era = pickRandom(eras);
    return NextResponse.json({ era, team } as EraResponse, { headers: { 'Cache-Control': 'no-store' } });
  }

  // For all sports, pick any random team + era (all eras available)
  // Try to avoid already-used eras
  let team: HistoricalTeam | null = null;
  let era: Era | null = null;

  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = pickRandom(teams);
    const eras = generateTeamEras(candidate);
    const available = eras.filter(e => !excludeSet.has(e.id));
    if (available.length > 0) {
      team = candidate;
      era = pickRandom(available);
      break;
    }
  }

  if (!team || !era) {
    // Fallback: ignore exclude
    team = pickRandom(teams);
    const eras = generateTeamEras(team);
    era = pickRandom(eras);
  }

  const response: EraResponse = { era, team };
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}
