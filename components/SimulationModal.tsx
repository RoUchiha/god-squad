'use client';

import { useEffect, useRef } from 'react';
import type { SeasonResults } from '@/lib/types';
import { SPORT_CONFIG } from '@/lib/constants';

interface Props {
  results: SeasonResults;
  onClose: () => void;
  onNewGame: () => void;
}

export default function SimulationModal({ results, onClose, onNewGame }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cfg = SPORT_CONFIG[results.sport];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={`
          relative w-full max-w-lg rounded-2xl overflow-hidden
          bg-[#111] border
          ${results.isUndefeated ? 'border-red-500 celebrate' : 'border-white/10'}
          animate-bounce-in
        `}
      >
        {/* Sport accent top bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${cfg.primaryColor}, ${cfg.accentColor})` }}
        />

        {/* Content */}
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-300 text-lg"
          >
            ✕
          </button>

          {/* Achievement headline */}
          <div className="text-center mb-6">
            <div
              className={`text-2xl font-black mb-1 ${results.isUndefeated ? 'text-red-400' : 'text-white'}`}
            >
              {results.achievement}
            </div>
            <div className="text-gray-400 text-sm">{results.achievementSubtext}</div>
          </div>

          {/* Record */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-5xl font-black text-white tabular-nums">{results.recordLabel}</div>
              <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Season Record</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black tabular-nums" style={{
                color: results.teamPower.gspr >= 950 ? '#ff4444'
                  : results.teamPower.gspr >= 850 ? '#ffd700'
                  : results.teamPower.gspr >= 700 ? '#a855f7'
                  : '#6b7280'
              }}>
                {results.teamPower.gspr}
              </div>
              <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">GSPR</div>
            </div>
          </div>

          {/* Season bar */}
          <SeasonBar games={results.games} />

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <StatBox label="Win %" value={`${(results.wins / results.totalGames * 100).toFixed(1)}%`} />
            <StatBox label="Streak" value={`W${results.longestWinStreak}`} />
            <StatBox label="Games" value={String(results.totalGames)} />
          </div>

          {/* Power breakdown */}
          <div className="mt-4 p-3 bg-black/30 rounded-lg">
            <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">Team Breakdown</div>
            <div className="grid grid-cols-2 gap-1">
              {results.teamPower.breakdown.map((line, i) => (
                <div key={i} className="text-xs text-gray-400">{line}</div>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={onNewGame}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
            >
              New Game
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${cfg.primaryColor}, ${cfg.accentColor})` }}
            >
              Back to Roster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeasonBar({ games }: { games: SeasonResults['games'] }) {
  return (
    <div>
      <div className="text-xs text-gray-600 mb-1.5">Season results</div>
      <div className="flex gap-[2px] flex-wrap">
        {games.map(g => (
          <div
            key={g.gameNumber}
            title={`Game ${g.gameNumber}: ${g.win ? 'W' : 'L'} (${g.opponentTier})`}
            className="rounded-[2px] transition-all"
            style={{
              width: games.length > 100 ? '4px' : '6px',
              height: games.length > 100 ? '10px' : '14px',
              backgroundColor: g.win ? '#22c55e' : '#ef4444',
              opacity: 0.85,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-2 bg-black/30 rounded-lg">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</div>
    </div>
  );
}
