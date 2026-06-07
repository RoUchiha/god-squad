'use client';

import type { Player, FilledRosterSlot } from '@/lib/types';

interface Props {
  player: Player;
  slots: FilledRosterSlot[];
  onPlace: (player: Player, slotId: string) => void;
  onCancel: () => void;
}

function scoreColor(score: number): string {
  if (score >= 85) return '#ffd700';
  if (score >= 70) return '#a855f7';
  if (score >= 55) return '#3b82f6';
  return '#6b7280';
}

function positionMatches(slotPos: Player['position'] | Player['position'][], playerPos: Player['position']): boolean {
  if (Array.isArray(slotPos)) return slotPos.includes(playerPos);
  return slotPos === playerPos;
}

export default function PlayerPlacementPicker({ player, slots, onPlace, onCancel }: Props) {
  const compatible = slots.filter(s => !s.player && positionMatches(s.position, player.position));
  const posLabel = player.position.replace('_MLB', '').replace('_NHL', '');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Player header */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold bg-white/10 text-gray-400 px-1.5 py-0.5 rounded uppercase">
                {posLabel}
              </span>
              {player.isLegend && <span className="text-[10px] text-yellow-500 font-bold">★ HOF</span>}
            </div>
            <div className="font-bold text-white truncate">{player.name}</div>
            <div className="text-xs text-gray-500">{player.yearsWithTeam}</div>
          </div>
          <div className="text-2xl font-black" style={{ color: scoreColor(player.playerScore) }}>
            {Math.round(player.playerScore)}
          </div>
        </div>

        {/* Slot options */}
        <div className="p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            {compatible.length > 0
              ? `Place ${player.name} at:`
              : `No open ${posLabel} slots`}
          </div>

          {compatible.length === 0 ? (
            <div className="text-sm text-gray-600 text-center py-4">
              All {posLabel} slots are filled.<br />
              Remove a player first.
            </div>
          ) : (
            <div className="space-y-2">
              {compatible.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => onPlace(player, slot.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 w-10">
                      {Array.isArray(slot.position)
                        ? slot.position.map(p => p.replace('_MLB','').replace('_NHL','')).join('/')
                        : slot.position.replace('_MLB','').replace('_NHL','')}
                    </span>
                    <span className="text-sm text-gray-300">{slot.label}</span>
                  </div>
                  <span className="text-xs text-gray-600">→ Place here</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Skip — advances era without placing */}
        <div className="px-4 pb-4">
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-300 border border-white/5 hover:border-white/10 transition-colors"
          >
            Skip this player → next era
          </button>
        </div>
      </div>
    </div>
  );
}
