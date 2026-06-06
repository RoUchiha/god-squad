'use client';

import type { Player, Sport } from '@/lib/types';
import PlayerCard from './PlayerCard';

interface Props {
  players: Player[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onSelect: (player: Player) => void;
  sport: Sport;
  highlightPositions: Player['position'][] | null;
}

export default function PlayerPool({ players, isLoading, selectedIds, onSelect, sport, highlightPositions }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Player Pool</h2>
        {!isLoading && players.length > 0 && (
          <span className="text-xs text-gray-600">{players.length} players</span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-lg" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="glass rounded-lg p-8 text-center text-gray-600 text-sm">
          No players loaded yet
        </div>
      ) : (
        <div className="space-y-1.5 overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-280px)] pr-1">
          {players.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              sport={sport}
              isSelected={selectedIds.has(player.id)}
              isHighlighted={
                highlightPositions !== null &&
                highlightPositions.includes(player.position)
              }
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
