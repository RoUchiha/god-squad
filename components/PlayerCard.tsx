'use client';

import type { Player, Sport } from '@/lib/types';

interface Props {
  player: Player;
  sport: Sport;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (player: Player) => void;
}

const STAT_LABELS: Record<string, string> = {
  // NBA
  points: 'PPG', rebounds: 'RPG', assists: 'APG', steals: 'SPG', blocks: 'BPG',
  turnovers: 'TO', fieldGoalPct: 'FG%', threePointPct: '3P%', freeThrowPct: 'FT%',
  // NFL
  passingYards: 'Pass Yds', passingTDs: 'TD', passerRating: 'RTG', interceptions: 'INT',
  rushingYards: 'Rush Yds', rushingTDs: 'Rush TD', receptions: 'REC',
  receivingYards: 'Rec Yds', receivingTDs: 'Rec TD',
  sacks: 'SCK', tackles: 'TKL', forcedFumbles: 'FF', passDeflections: 'PD',
  // MLB
  battingAvg: 'AVG', homeRuns: 'HR', rbi: 'RBI', ops: 'OPS', stolenBases: 'SB', onBasePct: 'OBP',
  era: 'ERA', whip: 'WHIP', strikeoutsPerNine: 'K/9', wins: 'W', saves: 'SV', inningsPitched: 'IP',
  // NHL
  goals: 'G', nhlAssists: 'A', nhlPoints: 'PTS', plusMinus: '+/-',
  powerPlayGoals: 'PPG', savePct: 'SV%', goalsAgainstAvg: 'GAA', penaltyMinutes: 'PIM',
  // Soccer
  soccerGoals: 'G', soccerAssists: 'A', soccerApps: 'Apps', cleanSheets: 'CS',
  savePctSoc: 'SV%', keyPasses: 'KP/G', tacklesPG: 'TKL/G',
};

function formatStatValue(key: string, value: number | undefined): string {
  if (value === undefined) return '—';
  if (['fieldGoalPct', 'threePointPct', 'battingAvg', 'onBasePct', 'sluggingPct', 'savePctSoc'].includes(key)) {
    return value.toFixed(3).replace('0.', '.');
  }
  if (['ops', 'savePct'].includes(key)) {
    return value >= 1 ? value.toFixed(3) : value.toFixed(3).replace('0.', '.');
  }
  if (key === 'plusMinus') return value >= 0 ? `+${value}` : String(value);
  if (['era', 'whip', 'goalsAgainstAvg'].includes(key)) {
    return value.toFixed(2);
  }
  if (['passerRating', 'strikeoutsPerNine'].includes(key)) {
    return value.toFixed(1);
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getKeyStats(player: Player, sport: Sport): [string, number | undefined][] {
  const s = player.stats;
  switch (sport) {
    case 'nba':
      return [
        ['points', s.points], ['rebounds', s.rebounds], ['assists', s.assists],
        ['steals', s.steals], ['blocks', s.blocks], ['fieldGoalPct', s.fieldGoalPct],
        ['threePointPct', s.threePointPct], ['freeThrowPct', s.freeThrowPct],
      ];
    case 'nfl':
      if (player.position === 'QB')
        return [['passingYards', s.passingYards], ['passingTDs', s.passingTDs], ['interceptions', s.interceptions], ['passerRating', s.passerRating]];
      if (player.position === 'RB')
        return [['rushingYards', s.rushingYards], ['rushingTDs', s.rushingTDs], ['receivingYards', s.receivingYards], ['receptions', s.receptions]];
      if (player.position === 'WR' || player.position === 'TE')
        return [['receptions', s.receptions], ['receivingYards', s.receivingYards], ['receivingTDs', s.receivingTDs]];
      if (player.position === 'DE' || player.position === 'DT')
        return [['sacks', s.sacks], ['tackles', s.tackles], ['forcedFumbles', s.forcedFumbles]];
      if (player.position === 'LB')
        return [['tackles', s.tackles], ['sacks', s.sacks], ['interceptions', s.interceptions], ['forcedFumbles', s.forcedFumbles]];
      // CB / S
      return [['interceptions', s.interceptions], ['tackles', s.tackles], ['passDeflections', s.passDeflections]];
    case 'mlb':
      if (player.positionGroup === 'pitching')
        return [['era', s.era], ['whip', s.whip], ['strikeoutsPerNine', s.strikeoutsPerNine], ['wins', s.wins], ['saves', s.saves], ['inningsPitched', s.inningsPitched]];
      return [['battingAvg', s.battingAvg], ['homeRuns', s.homeRuns], ['rbi', s.rbi], ['ops', s.ops], ['onBasePct', s.onBasePct], ['stolenBases', s.stolenBases]];
    case 'nhl':
      if (player.position === 'G_NHL')
        return [['savePct', s.savePct], ['goalsAgainstAvg', s.goalsAgainstAvg]];
      if (player.positionGroup === 'defense')
        return [['nhlPoints', s.nhlPoints], ['goals', s.goals], ['nhlAssists', s.nhlAssists], ['plusMinus', s.plusMinus], ['powerPlayGoals', s.powerPlayGoals]];
      return [['goals', s.goals], ['nhlAssists', s.nhlAssists], ['nhlPoints', s.nhlPoints], ['plusMinus', s.plusMinus], ['powerPlayGoals', s.powerPlayGoals]];
    case 'epl':
    case 'wcup':
      if (player.position === 'GK')
        return [['soccerApps', s.soccerApps], ['cleanSheets', s.cleanSheets], ['savePctSoc', s.savePctSoc]];
      if (player.positionGroup === 'defense')
        return [['soccerApps', s.soccerApps], ['soccerGoals', s.soccerGoals], ['soccerAssists', s.soccerAssists], ['tacklesPG', s.tacklesPG]];
      return [['soccerApps', s.soccerApps], ['soccerGoals', s.soccerGoals], ['soccerAssists', s.soccerAssists], ['keyPasses', s.keyPasses]];
    default:
      return [];
  }
}

function scoreColor(score: number): string {
  if (score >= 85) return '#ffd700';
  if (score >= 70) return '#a855f7';
  if (score >= 55) return '#3b82f6';
  return '#6b7280';
}

export default function PlayerCard({ player, sport, isSelected, isHighlighted, onSelect }: Props) {
  const keyStats = getKeyStats(player, sport);

  return (
    <button
      onClick={() => !isSelected && onSelect(player)}
      disabled={isSelected}
      className={`
        w-full text-left p-3 rounded-lg border transition-all duration-150
        ${isSelected
          ? 'opacity-30 cursor-not-allowed border-white/5 bg-white/2'
          : isHighlighted
            ? 'border-yellow-500/60 bg-yellow-950/30 hover:bg-yellow-950/50 cursor-pointer'
            : 'glass glass-hover border-white/5 hover:border-white/20 cursor-pointer active:scale-[0.98]'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}
            >
              {player.position.replace('_MLB', '').replace('_NHL', '')}
            </span>
            {player.isLegend && (
              <span className="text-[10px] font-bold text-yellow-500">★ HOF</span>
            )}
            {player.isAllStar && !player.isLegend && (
              <span className="text-[10px] font-bold text-blue-400">⭐</span>
            )}
          </div>
          <div className="font-semibold text-sm text-white mt-1 truncate">{player.name}</div>
          <div className="text-[10px] text-gray-600 mt-0.5">
            {player.yearsWithTeam}
            {player.bestSeasonYear && (
              <span className="ml-1.5 text-blue-500/70">{player.bestSeasonYear}</span>
            )}
          </div>
        </div>

        <div
          className="text-lg font-black flex-shrink-0 tabular-nums"
          style={{ color: scoreColor(player.playerScore) }}
        >
          {Math.round(player.playerScore)}
        </div>
      </div>

      {/* Key stats */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
        {keyStats.filter(([, v]) => v !== undefined).map(([key, val]) => (
          <div key={key} className="flex items-baseline gap-1">
            <span className="text-[10px] text-gray-600">{STAT_LABELS[key] ?? key}</span>
            <span className="text-xs font-semibold text-gray-300">{formatStatValue(key, val)}</span>
          </div>
        ))}
      </div>
    </button>
  );
}
