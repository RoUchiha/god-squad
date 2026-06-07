import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Sport, PlayersResponse, HistoricalTeam, Player } from '@/lib/types';
import { generateTeamEras } from '@/lib/constants';
import { MLB_TEAMS, fetchMLBPlayers } from '@/lib/sports/mlb';
import { NHL_TEAMS, fetchNHLPlayers } from '@/lib/sports/nhl';
import { NBA_TEAMS, fetchNBAPlayers } from '@/lib/sports/nba';
import { NFL_TEAMS, fetchNFLPlayers } from '@/lib/sports/nfl';
import { EPL_TEAMS, WCUP_TEAMS, fetchSoccerPlayers } from '@/lib/sports/soccer';

const ParamsSchema = z.object({
  sport: z.enum(['nba', 'nfl', 'mlb', 'nhl', 'epl', 'wcup']),
});

const QuerySchema = z.object({
  teamId: z.string().min(1).max(20).regex(/^[a-zA-Z0-9]+$/),
  eraId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9-]+$/),
});

const TEAMS_BY_SPORT: Record<Sport, HistoricalTeam[]> = {
  mlb: MLB_TEAMS,
  nhl: NHL_TEAMS,
  nba: NBA_TEAMS,
  nfl: NFL_TEAMS,
  epl: EPL_TEAMS,
  wcup: WCUP_TEAMS,
};

// Scores are absolute (2K-style 25–99 scale) — no pool normalization needed.
// Deterministic from hardcoded stats + accolade flags; never shifts on refresh.

export async function GET(
  req: NextRequest,
  { params }: { params: { sport: string } }
) {
  const routeParsed = ParamsSchema.safeParse(params);
  if (!routeParsed.success) {
    return NextResponse.json({ error: 'Invalid sport' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const queryParsed = QuerySchema.safeParse({
    teamId: searchParams.get('teamId') ?? '',
    eraId: searchParams.get('eraId') ?? '',
  });

  if (!queryParsed.success) {
    return NextResponse.json({ error: 'Missing or invalid teamId/eraId' }, { status: 400 });
  }

  const sport = routeParsed.data.sport as Sport;
  const { teamId, eraId } = queryParsed.data;

  const teams = TEAMS_BY_SPORT[sport];
  const team = teams.find(t => t.id === teamId);
  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  // Reconstruct era from team's generated era list — never trust raw year from URL
  const era = generateTeamEras(team).find(e => e.id === eraId);
  if (!era) {
    return NextResponse.json({ error: 'Era not found for this team' }, { status: 404 });
  }

  try {
    let players: Player[];
    switch (sport) {
      case 'mlb':
        players = await fetchMLBPlayers(team, era);
        break;
      case 'nhl':
        players = await fetchNHLPlayers(team, era);
        break;
      case 'nba':
        players = await fetchNBAPlayers(team, era, process.env.BALLDONTLIE_API_KEY);
        break;
      case 'nfl':
        players = await fetchNFLPlayers(team, era);
        break;
      case 'epl':
      case 'wcup':
        players = await fetchSoccerPlayers(team, era);
        break;
      default:
        return NextResponse.json({ error: 'Sport not implemented' }, { status: 501 });
    }

    const response: PlayersResponse = { players, era, team };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error(`[players/${sport}] Error:`, err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json(
      { error: 'Failed to fetch player data. Please try again.' },
      { status: 502 }
    );
  }
}
