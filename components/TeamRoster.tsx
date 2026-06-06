'use client';

import type { FilledRosterSlot, Sport, Player } from '@/lib/types';

interface Props {
  slots: FilledRosterSlot[];
  sport: Sport;
  onRemove: (slotId: string) => void;
  onPositionSwap: (slotId: string, position: Player['position'] | Player['position'][]) => void;
  positionSwapUsed: boolean;
}

export default function TeamRoster({ slots, sport, onRemove, onPositionSwap, positionSwapUsed }: Props) {
  const offenseSlots = slots.filter(s => s.group === 'offense');
  const defenseSlots = slots.filter(s => s.group === 'defense' || s.group === 'pitching' || s.group === 'goalie');

  return (
    <div className="flex flex-col">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Your Roster</h2>

      <div className="space-y-1 overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-280px)] pr-1">
        {offenseSlots.length > 0 && (
          <SlotGroup
            label={sport === 'mlb' ? 'Lineup' : sport === 'nhl' ? 'Forwards' : 'Offense'}
            slots={offenseSlots}
            onRemove={onRemove}
            onPositionSwap={onPositionSwap}
            positionSwapUsed={positionSwapUsed}
          />
        )}
        {defenseSlots.length > 0 && (
          <SlotGroup
            label={sport === 'mlb' ? 'Pitching' : sport === 'nhl' ? 'Defense / G' : 'Defense'}
            slots={defenseSlots}
            onRemove={onRemove}
            onPositionSwap={onPositionSwap}
            positionSwapUsed={positionSwapUsed}
          />
        )}
      </div>
    </div>
  );
}

function SlotGroup({
  label,
  slots,
  onRemove,
  onPositionSwap,
  positionSwapUsed,
}: {
  label: string;
  slots: FilledRosterSlot[];
  onRemove: (id: string) => void;
  onPositionSwap: (id: string, pos: Player['position'] | Player['position'][]) => void;
  positionSwapUsed: boolean;
}) {
  return (
    <div className="mb-3">
      <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5 px-1">{label}</div>
      <div className="space-y-1">
        {slots.map(slot => (
          <RosterSlot
            key={slot.id}
            slot={slot}
            onRemove={onRemove}
            onPositionSwap={onPositionSwap}
            positionSwapUsed={positionSwapUsed}
          />
        ))}
      </div>
    </div>
  );
}

function RosterSlot({
  slot,
  onRemove,
  onPositionSwap,
  positionSwapUsed,
}: {
  slot: FilledRosterSlot;
  onRemove: (id: string) => void;
  onPositionSwap: (id: string, pos: Player['position'] | Player['position'][]) => void;
  positionSwapUsed: boolean;
}) {
  const posLabel = Array.isArray(slot.position)
    ? slot.position.map(p => p.replace('_MLB', '').replace('_NHL', '')).join('/')
    : slot.position.replace('_MLB', '').replace('_NHL', '');

  if (!slot.player) {
    return (
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          ${slot.required
            ? 'border-dashed border-white/15 bg-white/2'
            : 'border-dashed border-white/8 bg-white/1 opacity-60'
          }
        `}
      >
        <span className="text-[10px] font-bold text-gray-600 w-8 flex-shrink-0">{posLabel}</span>
        <span className="text-xs text-gray-700 italic">
          {slot.required ? 'Click player to fill' : 'Optional'}
        </span>
      </div>
    );
  }

  const p = slot.player;
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 group">
      <span className="text-[10px] font-bold text-gray-500 w-8 flex-shrink-0">{posLabel}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{p.name}</div>
        <div className="text-[10px] text-gray-600">{p.yearsWithTeam}</div>
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(p.playerScore) }}>
        {Math.round(p.playerScore)}
      </span>

      {/* Swap button (only if reroll available) */}
      {!positionSwapUsed && (
        <button
          onClick={() => onPositionSwap(slot.id, slot.position)}
          title="Use position swap reroll"
          className="text-[10px] text-yellow-600 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity px-1"
        >
          🔄
        </button>
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(slot.id)}
        className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-sm ml-0.5"
      >
        ✕
      </button>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 85) return '#ffd700';
  if (score >= 70) return '#a855f7';
  if (score >= 55) return '#3b82f6';
  return '#6b7280';
}
