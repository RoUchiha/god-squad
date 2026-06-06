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
  points: 'PPG', rebounds: 'RPG', assists: 'APG', steals: 'SPG', blocks: 'BPG',
  fieldGoalPct: 'FG%', threePointPct: '3P%',
  passingYards: 'Pass Yds', passingTDs: 'Pass TD', passerRating: 'Rating',
  rushingYards: 'Rush Yds', rushingTDs: 'Rush TD',
  receivingYards: 'Rec Yds', receivingTDs: 'Rec TD', receptions: 'REC',
  sacks: 'Sacks', interceptions: 'INT', tackles: 'TKL',
  battingAvg: 'AVG', homeRuns: 'HR', rbi: 'RBI', ops: 'OPS',
  era: 'ERA', whip: 'WHIP', strikeoutsPerNine: 'K/9', wins: 'W', saves: 'SV',
  goals: 'G', nhlPoints: 'PTS', plusMinus: '+/-', savePct: 'SV%', goalsAgainstAvg: 'GAA',
};

function formatStatValue(key: string, value: number | undefined): string {
  if (value === undefined) return '—';
  if (['fieldGoalPct', 'threePointPct', 'battingAvg', 'onBasePct', 'sluggingPct'].includes(key)) {
    return value.toFixed(3).replace('0.', '.');
  }
  if (['ops', 'savePct'].includes(key)) {
    return value >= 1 ? value.toFixed(3) : value.toFixed(3).replace('0.', '.');
  }
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
        ['fieldGoalPct', s.fieldGoalPct],
      ];
    case 'nfl':
      if (player.position === 'QB') return [['passingYards', s.passingYards], ['passingTDs', s.passingTDs], ['passerRating', s.passerRating]];
      if (player.position === 'RB') return [['rushingYards', s.rushingYards], ['rushingTDs', s.rushingTDs]];
      if (player.position === 'WR' || player.position === 'TE') return [['receivingYards', s.receivingYards], ['receivingTDs', s.receivingTDs], ['receptions', s.receptions]];
      if (player.position === 'DE' || player.position === 'DT') return [['sacks', s.sacks], ['tackles', s.tackles]];
      return [['sacks', s.sacks], ['tackles', s.tackles], ['interceptions', s.interceptions]];
    case 'mlb':
      if (player.positionGroup === 'pitching') return [['era', s.era], ['whip', s.whip], ['wins', s.wins], ['saves', s.saves]];
      return [['battingAvg', s.battingAvg], ['homeRuns', s.homeRuns], ['rbi', s.rbi], ['ops', s.ops]];
    case 'nhl':
      if (player.position === 'G_NHL') return [['savePct', s.savePct], ['goalsAgainstAvg', s.goalsAgainstAvg]];
      return [['goals', s.goals], ['nhlPoints', s.nhlPoints], ['plusMinus', s.plusMinus]];
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
          <div className="text-[10px] text-gray-600 mt-0.5">{player.yearsWithTeam}</div>
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
