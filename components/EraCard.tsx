'use client';

import type { Sport, Era, HistoricalTeam } from '@/lib/types';

interface Props {
  era: Era | null;
  team: HistoricalTeam | null;
  isLoading: boolean;
  sport: Sport;
}

export default function EraCard({ era, team, isLoading, sport }: Props) {
  if (isLoading) {
    return (
      <div className="flex-1 glass rounded-xl p-4 animate-pulse">
        <div className="skeleton h-4 w-32 rounded mb-2" />
        <div className="skeleton h-6 w-48 rounded mb-1" />
        <div className="skeleton h-3 w-64 rounded" />
      </div>
    );
  }

  if (!era || !team) {
    return (
      <div className="flex-1 glass rounded-xl p-4 text-gray-600 text-sm">
        Loading era...
      </div>
    );
  }

  return (
    <div
      className="flex-1 glass glass-hover rounded-xl p-4 border-l-4 transition-all"
      style={{ borderLeftColor: team.primaryColor }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            {era.startYear}–{era.endYear} Era
          </div>
          <div className="text-lg font-bold text-white">
            {team.city} {team.name}
          </div>
          <div className="text-xs text-gray-400 mt-1 max-w-xs">
            {era.name} · {era.description}
          </div>
        </div>
        <div
          className="text-2xl font-black text-right ml-4 opacity-80 flex-shrink-0"
          style={{ color: team.secondaryColor }}
        >
          {team.abbreviation}
        </div>
      </div>
    </div>
  );
}
