'use client';

/**
 * PlayerPool — two-step draft UI:
 *   1. Click a card to SELECT it (highlight only, no commit)
 *   2. Click the DRAFT button to COMMIT the pick
 *
 * This eliminates the multi-pick bug by design: player cards never directly
 * trigger a pick. Only the single DRAFT button does, and it disables itself
 * immediately on first click before the parent re-renders.
 */

import { useState, useCallback, useRef } from 'react';
import type { Player, Sport, DraftMode } from '@/lib/types';
import PlayerCard from './PlayerCard';

interface Props {
  players: Player[];
  isLoading: boolean;
  sport: Sport;
  mode?: DraftMode;
  onDraft: (player: Player) => void;
  onSkip: () => void;
}

const SKELETON_COUNT = 8;

export default function PlayerPool({ players, isLoading, sport, mode, onDraft, onSkip }: Props) {
  const [selected, setSelected] = useState<Player | null>(null);
  const [draftFired, setDraftFired] = useState(false);
  // Ref mirrors draftFired — read at call-time so rapid clicks see the
  // updated value even before React re-renders with the new state.
  const draftFiredRef = useRef(false);

  const visiblePlayers = (sport === 'nfl' && mode && mode !== 'combined')
    ? players.filter(p => p.positionGroup === mode)
    : players;

  const handleCardClick = useCallback((player: Player) => {
    if (draftFiredRef.current) return;
    setSelected(prev => prev?.id === player.id ? null : player);
  }, []);

  const handleDraft = useCallback(() => {
    if (!selected || draftFiredRef.current) return;
    // Write ref FIRST — synchronous, never stale in closures
    draftFiredRef.current = true;
    setDraftFired(true);  // visual only
    onDraft(selected);
  }, [selected, onDraft]);

  const handleSkip = useCallback(() => {
    if (draftFiredRef.current) return;
    draftFiredRef.current = true;
    setDraftFired(true);
    onSkip();
  }, [onSkip]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Player Pool</h2>
          {selected && !draftFired && (
            <p className="text-xs text-yellow-400 mt-0.5">
              <span className="font-semibold">{selected.name}</span> selected — confirm below ↓
            </p>
          )}
        </div>
        {!isLoading && visiblePlayers.length > 0 && (
          <span className="text-xs text-gray-600">{visiblePlayers.length} players</span>
        )}
      </div>

      {/* Card list */}
      {isLoading ? (
        <div className="space-y-2 flex-1">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-lg" />
          ))}
        </div>
      ) : visiblePlayers.length === 0 ? (
        <div className="glass rounded-lg p-8 text-center text-gray-600 text-sm flex-1">
          No players loaded
        </div>
      ) : (
        <div className="space-y-1.5 overflow-y-auto max-h-[48vh] lg:max-h-[calc(100vh-340px)] pr-1 flex-1">
          {visiblePlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              sport={sport}
              isSelected={false}
              isHighlighted={selected?.id === player.id}
              onSelect={handleCardClick}
            />
          ))}
        </div>
      )}

      {/* Draft / Skip controls — always visible at bottom */}
      {!isLoading && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDraft}
            disabled={!selected || draftFired}
            className={`
              flex-1 py-3 rounded-xl font-bold text-sm transition-all
              ${selected && !draftFired
                ? 'bg-white text-black hover:bg-gray-200 active:scale-[0.98] cursor-pointer'
                : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }
            `}
          >
            {draftFired ? '✓ Drafted' : selected ? `DRAFT  ${selected.name}` : 'Select a player'}
          </button>
          <button
            onClick={handleSkip}
            disabled={draftFired}
            className="px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-gray-300 border border-white/5 hover:border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Skip this era → next pick"
          >
            Skip →
          </button>
        </div>
      )}
    </div>
  );
}
