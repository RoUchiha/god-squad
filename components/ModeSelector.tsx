'use client';

import type { DraftMode } from '@/lib/types';

interface Props {
  mode: DraftMode;
  onChange: (mode: DraftMode) => void;
}

const MODES: { value: DraftMode; label: string; icon: string }[] = [
  { value: 'offense', label: 'Offense', icon: '⚔️' },
  { value: 'defense', label: 'Defense', icon: '🛡️' },
  { value: 'combined', label: 'Full Squad', icon: '⚡' },
];

export default function ModeSelector({ mode, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5 self-start">
      {MODES.map(m => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
            transition-all duration-200
            ${mode === m.value
              ? 'bg-white/10 text-white'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }
          `}
        >
          <span>{m.icon}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}
