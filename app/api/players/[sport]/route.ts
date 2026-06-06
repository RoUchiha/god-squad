import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Sport, PlayersResponse, HistoricalTeam, Era } from '@/lib/types';
import { ERAS_BY_SPORT } from '@/lib/constants';
import { MLB_TEAMS, fetchMLBPlayers } from '@/lib/sports/mlb';
import { NHL_TEAMS, fetchNHLPlayers } from '@/lib/sports/nhl';
import { NBA_TEAMS, fetchNBAPlayers } from '@/lib/sports/nba';
import { NFL_TEAMS, fetchNFLPlayers } from '@/lib/sports/nfl';

const ParamsSchema = z.object({
  sport: z.enum(['nba', 'nfl', 'mlb', 'nhl']),
});

const QuerySchema = z.object({
  teamId: z.string().min(1).max(20).regex(/^[a-zA-Z0-9]+$/),
  eraId: z.string().min(1).max(40).regex(/^[a-zA-Z0-9-]+$/),
});

const TEAMS_BY_SPORT: Record<Sport, HistoricalTeam[]> = {
  mlb: MLB_TEAMS,
  nhl: NHL_TEAMS,
  nba: NBA_TEAMS,
  nfl: NFL_TEAMS,
};

export async function GET(
  req: NextRequest,
  { params }: { params: { sport: string } }
) {
  // Validate route param
  const routeParsed = ParamsSchema.safeParse(params);
  if (!routeParsed.success) {
    return NextResponse.json({ error: 'Invalid sport' }, { status: 400 });
  }

  // Validate query params
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

  // Look up team and era from our own data (never trust raw IDs to reach external APIs)
  const teams = TEAMS_BY_SPORT[sport];
  const eras = ERAS_BY_SPORT[sport];

  const team = teams.find(t => t.id === teamId);
  const era = eras.find(e => e.id === eraId);

  if (!team || !era) {
    return NextResponse.json({ error: 'Team or era not found' }, { status: 404 });
  }

  try {
    let players;
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
