'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  Sport, DraftMode, FilledRosterSlot, Player,
  EraResponse, PlayersResponse, SeasonResults,
  Era, HistoricalTeam, RerollState
} from '@/lib/types';
import { getRosterTemplates, SPORT_CONFIG } from '@/lib/constants';
import { computeTeamGSPR } from '@/lib/algorithms/powerRating';
import SportTabBar from './SportTabBar';
import EraCard from './EraCard';
import PlayerPool from './PlayerPool';
import TeamRoster from './TeamRoster';
import PowerMeter from './PowerMeter';
import RerollBar from './RerollBar';
import ModeSelector from './ModeSelector';
import SimulationModal from './SimulationModal';

export default function GameContainer() {
  const loadIdRef = useRef(0); // cancels stale async loads
  const [sport, setSport] = useState<Sport>('nba');
  const [mode, setMode] = useState<DraftMode>('combined');
  const [era, setEra] = useState<Era | null>(null);
  const [team, setTeam] = useState<HistoricalTeam | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [slots, setSlots] = useState<FilledRosterSlot[]>([]);
  const [rerolls, setRerolls] = useState<RerollState>({ teamUsed: false, eraUsed: false, positionSwapUsed: false });
  const [results, setResults] = useState<SeasonResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingEra, setIsLoadingEra] = useState(false);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swapMode, setSwapMode] = useState<{ slotId: string; position: Player['position'] | Player['position'][] } | null>(null);

  const gspr = slots.length > 0 && team
    ? computeTeamGSPR(slots, sport, mode).gspr
    : 0;

  const isRosterFull = slots.length > 0 && slots.filter(s => s.required && !s.player).length === 0;

  // Load a random era+team for the given sport
  const loadEra = useCallback(async (s: Sport) => {
    const myId = ++loadIdRef.current; // each call gets a unique ID
    setIsLoadingEra(true);
    setError(null);
    setPlayers([]);
    setResults(null);
    setShowResults(false);

    try {
      const res = await fetch(`/api/era/${s}`);
      if (!res.ok) throw new Error('Failed to load era');
      const data: EraResponse = await res.json();
      if (myId !== loadIdRef.current) return; // stale — a newer load started
      setEra(data.era);
      setTeam(data.team);
      await loadPlayers(s, data.team.id, data.era.id, myId);
    } catch {
      if (myId === loadIdRef.current) setError('Failed to load game data. Please try again.');
    } finally {
      if (myId === loadIdRef.current) setIsLoadingEra(false);
    }
  }, []);

  const loadPlayers = useCallback(async (s: Sport, teamId: string, eraId: string, expectedId?: number) => {
    setIsLoadingPlayers(true);
    setError(null);

    try {
      const res = await fetch(`/api/players/${s}?teamId=${teamId}&eraId=${eraId}`);
      if (!res.ok) throw new Error('Failed to load players');
      const data: PlayersResponse = await res.json();
      if (expectedId !== undefined && expectedId !== loadIdRef.current) return;
      setPlayers(data.players);
    } catch {
      if (expectedId === undefined || expectedId === loadIdRef.current) {
        setError('Failed to load players. Please try again.');
      }
    } finally {
      if (expectedId === undefined || expectedId === loadIdRef.current) {
        setIsLoadingPlayers(false);
      }
    }
  }, []);

  // Initialize roster slots when sport/mode changes
  useEffect(() => {
    const templates = getRosterTemplates(sport, mode);
    setSlots(templates.map(t => ({ ...t, player: null })));
  }, [sport, mode]);

  // Load initial era when sport changes
  useEffect(() => {
    setRerolls({ teamUsed: false, eraUsed: false, positionSwapUsed: false });
    loadEra(sport);
  }, [sport, loadEra]);

  const handleSportChange = (s: Sport) => {
    setSport(s);
    setMode(SPORT_CONFIG[s].hasModes ? 'combined' : 'combined');
  };

  const handleModeChange = (m: DraftMode) => {
    setMode(m);
    setSlots(getRosterTemplates(sport, m).map(t => ({ ...t, player: null })));
  };

  const positionMatches = (slotPos: Player['position'] | Player['position'][], playerPos: Player['position']): boolean => {
    if (Array.isArray(slotPos)) return slotPos.includes(playerPos);
    return slotPos === playerPos;
  };

  const handleSelectPlayer = (player: Player) => {
    if (swapMode) {
      // Swap mode: replace specific slot
      setSlots(prev => prev.map(s =>
        s.id === swapMode.slotId ? { ...s, player } : s
      ));
      setSwapMode(null);
      return;
    }

    // Find first empty slot that accepts this player's position
    setSlots(prev => {
      const idx = prev.findIndex(s =>
        !s.player && positionMatches(s.position, player.position)
      );
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], player };
      return updated;
    });
  };

  const handleRemovePlayer = (slotId: string) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, player: null } : s));
  };

  const handleTeamReroll = async () => {
    if (rerolls.teamUsed || !era) return;
    setRerolls(r => ({ ...r, teamUsed: true }));
    // Get same era, different team
    setIsLoadingEra(true);
    try {
      let newTeam = team;
      // Try up to 5 times to get a different team
      for (let i = 0; i < 5; i++) {
        const res = await fetch(`/api/era/${sport}`);
        const data: EraResponse = await res.json();
        if (data.team.id !== team?.id) { newTeam = data.team; break; }
      }
      if (newTeam && newTeam.id !== team?.id) {
        setTeam(newTeam);
        setSlots(prev => prev.map(s => ({ ...s, player: null })));
        await loadPlayers(sport, newTeam.id, era.id);
      }
    } finally {
      setIsLoadingEra(false);
    }
  };

  const handleEraReroll = async () => {
    if (rerolls.eraUsed) return;
    setRerolls(r => ({ ...r, eraUsed: true }));
    setSlots(prev => prev.map(s => ({ ...s, player: null })));
    await loadEra(sport);
  };

  const handlePositionSwap = (slotId: string, position: Player['position'] | Player['position'][]) => {
    if (rerolls.positionSwapUsed) return;
    setRerolls(r => ({ ...r, positionSwapUsed: true }));
    // Remove the current player from that slot and enter swap mode
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, player: null } : s));
    setSwapMode({ slotId, position });
  };

  const handleSimulate = async () => {
    if (!isRosterFull) return;
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport, mode, slots }),
      });
      if (!res.ok) throw new Error('Simulation failed');
      const data: SeasonResults = await res.json();
      setResults(data);
      setShowResults(true);
    } catch {
      setError('Simulation failed. Please try again.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleNewGame = () => {
    setResults(null);
    setShowResults(false);
    setSlots(prev => prev.map(s => ({ ...s, player: null })));
    setRerolls({ teamUsed: false, eraUsed: false, positionSwapUsed: false });
    loadEra(sport);
  };

  const selectedPlayerIds = new Set(slots.map(s => s.player?.id).filter(Boolean) as string[]);
  const cfg = SPORT_CONFIG[sport];

  return (
    <div className={`theme-${sport} min-h-screen`}>
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="font-black text-xl tracking-tight text-white">
              GOD SQUAD
            </span>
            <span className="text-xs text-gray-500 hidden sm:block">{cfg.tagline}</span>
          </div>
          <SportTabBar activeSport={sport} onChange={handleSportChange} />
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-200">✕</button>
          </div>
        )}

        {/* Era info + Mode selector row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <EraCard
            era={era}
            team={team}
            isLoading={isLoadingEra}
            sport={sport}
          />
          {SPORT_CONFIG[sport].hasModes && (
            <ModeSelector mode={mode} onChange={handleModeChange} />
          )}
        </div>

        {/* Reroll controls */}
        <RerollBar
          rerolls={rerolls}
          onTeamReroll={handleTeamReroll}
          onEraReroll={handleEraReroll}
          isLoading={isLoadingEra}
        />

        {swapMode && (
          <div className="mb-3 px-4 py-2 bg-yellow-950/60 border border-yellow-700 rounded-lg text-yellow-300 text-sm flex items-center gap-2">
            <span>🔄</span>
            <span>Position swap active — click a player from the pool to swap them in.</span>
            <button onClick={() => setSwapMode(null)} className="ml-auto text-yellow-400 hover:text-yellow-200 text-xs">Cancel</button>
          </div>
        )}

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr_1px_280px] gap-4 mt-4">
          {/* Player Pool */}
          <PlayerPool
            players={players}
            isLoading={isLoadingPlayers}
            selectedIds={selectedPlayerIds}
            onSelect={handleSelectPlayer}
            sport={sport}
            highlightPositions={swapMode ? (Array.isArray(swapMode.position) ? swapMode.position : [swapMode.position]) : null}
          />

          <div className="hidden lg:block bg-white/5" />

          {/* Team Roster */}
          <TeamRoster
            slots={slots}
            sport={sport}
            onRemove={handleRemovePlayer}
            onPositionSwap={handlePositionSwap}
            positionSwapUsed={rerolls.positionSwapUsed}
          />

          <div className="hidden lg:block bg-white/5" />

          {/* Right panel: Power Meter + Simulate */}
          <div className="flex flex-col gap-4">
            <PowerMeter gspr={gspr} slots={slots} sport={sport} mode={mode} />

            <button
              onClick={handleSimulate}
              disabled={!isRosterFull || isSimulating}
              className={`
                w-full py-4 rounded-xl font-black text-lg tracking-wide uppercase
                transition-all duration-200
                ${isRosterFull && !isSimulating
                  ? 'bg-gradient-to-r from-[var(--sport-primary)] to-[var(--sport-accent)] text-white hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }
                ${isSimulating ? 'animate-pulse' : ''}
              `}
            >
              {isSimulating ? 'Simulating...' : isRosterFull ? '⚡ Simulate Season' : 'Fill Roster to Simulate'}
            </button>

            <div className="text-center text-xs text-gray-600">
              {slots.filter(s => s.required && !s.player).length > 0
                ? `${slots.filter(s => s.required && !s.player).length} required slots remaining`
                : slots.filter(s => !s.player).length > 0
                  ? `${slots.filter(s => !s.player).length} optional slots empty`
                  : '✓ Roster complete — ready to simulate!'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && results && (
        <SimulationModal
          results={results}
          onClose={() => setShowResults(false)}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
