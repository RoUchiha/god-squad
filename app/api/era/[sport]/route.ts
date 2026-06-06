import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Sport, EraResponse, HistoricalTeam } from '@/lib/types';
import { generateTeamEras } from '@/lib/constants';
import { MLB_TEAMS } from '@/lib/sports/mlb';
import { NHL_TEAMS } from '@/lib/sports/nhl';
import { NBA_TEAMS, NBA_CURATED_ERA_KEYS } from '@/lib/sports/nba';
import { NFL_TEAMS, NFL_CURATED_ERA_KEYS } from '@/lib/sports/nfl';

const TEAMS_BY_SPORT = {
  mlb: MLB_TEAMS,
  nhl: NHL_TEAMS,
  nba: NBA_TEAMS,
  nfl: NFL_TEAMS,
};

const ParamsSchema = z.object({
  sport: z.enum(['nba', 'nfl', 'mlb', 'nhl']),
});

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Parse a curated key like "14-nba-14-1980" → { teamId: "14", eraId: "nba-14-1980" }
function parseCuratedKey(key: string): { teamId: string; eraId: string } | null {
  const dashIdx = key.indexOf('-');
  if (dashIdx === -1) return null;
  return { teamId: key.slice(0, dashIdx), eraId: key.slice(dashIdx + 1) };
}

function pickCuratedEra(
  curatedKeys: string[],
  teams: HistoricalTeam[]
): { team: HistoricalTeam; eraId: string } | null {
  const shuffled = [...curatedKeys].sort(() => Math.random() - 0.5);
  for (const key of shuffled) {
    const parsed = parseCuratedKey(key);
    if (!parsed) continue;
    const team = teams.find(t => t.id === parsed.teamId);
    if (team) return { team, eraId: parsed.eraId };
  }
  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { sport: string } }
) {
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid sport. Must be one of: nba, nfl, mlb, nhl' },
      { status: 400 }
    );
  }

  const sport = parsed.data.sport as Sport;
  const teams = TEAMS_BY_SPORT[sport];

  // For NBA and NFL, only pick from team+era combos that have hardcoded real rosters
  if (sport === 'nba' || sport === 'nfl') {
    const curatedKeys = sport === 'nba' ? NBA_CURATED_ERA_KEYS : NFL_CURATED_ERA_KEYS;
    const picked = pickCuratedEra(curatedKeys, teams);
    if (picked) {
      const eras = generateTeamEras(picked.team);
      const era = eras.find(e => e.id === picked.eraId);
      if (era) {
        const response: EraResponse = { era, team: picked.team };
        return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
      }
    }
  }

  // MLB and NHL: pick any random team + era (APIs work for these)
  const team = pickRandom(teams);
  const eras = generateTeamEras(team);
  const era = pickRandom(eras);

  const response: EraResponse = { era, team };
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}
