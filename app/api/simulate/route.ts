import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { FilledRosterSlot, Sport, DraftMode } from '@/lib/types';
import { computeTeamGSPR } from '@/lib/algorithms/powerRating';
import { simulateSeason } from '@/lib/algorithms/simulator';

const PlayerStatsSchema = z.object({
  points: z.number().optional(),
  rebounds: z.number().optional(),
  assists: z.number().optional(),
  steals: z.number().optional(),
  blocks: z.number().optional(),
  fieldGoalPct: z.number().optional(),
  threePointPct: z.number().optional(),
  freeThrowPct: z.number().optional(),
  passingYards: z.number().optional(),
  passingTDs: z.number().optional(),
  passerRating: z.number().optional(),
  rushingYards: z.number().optional(),
  rushingTDs: z.number().optional(),
  receivingYards: z.number().optional(),
  receivingTDs: z.number().optional(),
  receptions: z.number().optional(),
  sacks: z.number().optional(),
  interceptions: z.number().optional(),
  tackles: z.number().optional(),
  forcedFumbles: z.number().optional(),
  battingAvg: z.number().optional(),
  homeRuns: z.number().optional(),
  rbi: z.number().optional(),
  onBasePct: z.number().optional(),
  sluggingPct: z.number().optional(),
  ops: z.number().optional(),
  stolenBases: z.number().optional(),
  era: z.number().optional(),
  whip: z.number().optional(),
  strikeoutsPerNine: z.number().optional(),
  wins: z.number().optional(),
  saves: z.number().optional(),
  inningsPitched: z.number().optional(),
  goals: z.number().optional(),
  nhlAssists: z.number().optional(),
  nhlPoints: z.number().optional(),
  plusMinus: z.number().optional(),
  savePct: z.number().optional(),
  goalsAgainstAvg: z.number().optional(),
  penaltyMinutes: z.number().optional(),
  powerPlayGoals: z.number().optional(),
  soccerGoals: z.number().optional(),
  soccerAssists: z.number().optional(),
  soccerApps: z.number().optional(),
  cleanSheets: z.number().optional(),
  savePctSoc: z.number().optional(),
  keyPasses: z.number().optional(),
  tacklesPG: z.number().optional(),
}).strict();

const PlayerSchema = z.object({
  id: z.string().max(60),
  name: z.string().max(80),
  position: z.string().max(10),
  positionGroup: z.enum(['offense', 'defense', 'pitching', 'goalie']).or(z.string()),
  yearsWithTeam: z.string().max(20),
  stats: PlayerStatsSchema,
  playerScore: z.number().min(0).max(100),
  isLegend: z.boolean().optional(),
  isAllStar: z.boolean().optional(),
});

const RosterSlotSchema = z.object({
  id: z.string(),
  position: z.union([z.string(), z.array(z.string())]),
  label: z.string(),
  group: z.enum(['offense', 'defense', 'pitching', 'goalie']).or(z.string()),
  required: z.boolean(),
  player: PlayerSchema.nullable(),
});

const SimulateBodySchema = z.object({
  sport: z.enum(['nba', 'nfl', 'mlb', 'nhl', 'epl', 'wcup']),
  mode: z.enum(['offense', 'defense', 'combined']),
  slots: z.array(RosterSlotSchema).max(30),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = SimulateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { sport, mode, slots } = parsed.data;

  // Type-cast validated data back to our domain types
  const typedSlots = slots as unknown as FilledRosterSlot[];

  const teamPower = computeTeamGSPR(typedSlots, sport as Sport, mode as DraftMode);
  const results = simulateSeason(teamPower, sport as Sport);

  return NextResponse.json(results, {
    headers: {
      'Cache-Control': 'no-store', // Each simulation is unique
    },
  });
}
