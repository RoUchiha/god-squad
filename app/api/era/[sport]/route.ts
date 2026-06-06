import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Sport, EraResponse } from '@/lib/types';
import { ERAS_BY_SPORT } from '@/lib/constants';
import { MLB_TEAMS } from '@/lib/sports/mlb';
import { NHL_TEAMS } from '@/lib/sports/nhl';
import { NBA_TEAMS } from '@/lib/sports/nba';
import { NFL_TEAMS } from '@/lib/sports/nfl';

const VALID_SPORTS: Sport[] = ['nba', 'nfl', 'mlb', 'nhl'];

const TEAMS_BY_SPORT = {
  mlb: MLB_TEAMS,
  nhl: NHL_TEAMS,
  nba: NBA_TEAMS,
  nfl: NFL_TEAMS,
};

const ParamsSchema = z.object({
  sport: z.enum(['nba', 'nfl', 'mlb', 'nhl']),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { sport: string } }
) {
  // Validate sport parameter
  const parsed = ParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid sport. Must be one of: nba, nfl, mlb, nhl' },
      { status: 400 }
    );
  }

  const sport = parsed.data.sport as Sport;
  const eras = ERAS_BY_SPORT[sport];
  const teams = TEAMS_BY_SPORT[sport];

  // Random era
  const era = eras[Math.floor(Math.random() * eras.length)];

  // Random team
  const team = teams[Math.floor(Math.random() * teams.length)];

  const response: EraResponse = { era, team };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-store', // Each request gets a fresh random result
    },
  });
}
