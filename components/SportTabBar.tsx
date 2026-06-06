'use client';

import type { Sport } from '@/lib/types';
import { SPORT_CONFIG } from '@/lib/constants';

const SPORTS: Sport[] = ['nba', 'nfl', 'mlb', 'nhl'];

interface Props {
  activeSport: Sport;
  onChange: (sport: Sport) => void;
}

export default function SportTabBar({ activeSport, onChange }: Props) {
  return (
    <nav className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
      {SPORTS.map(sport => {
        const cfg = SPORT_CONFIG[sport];
        const isActive = sport === activeSport;
        return (
          <button
            key={sport}
            onClick={() => onChange(sport)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold
              transition-all duration-200
              ${isActive
                ? 'text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }
            `}
            style={isActive ? { backgroundColor: cfg.primaryColor } : undefined}
          >
            <span>{cfg.emoji}</span>
            <span className="hidden sm:inline">{cfg.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
