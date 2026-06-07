'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
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
import PlayerPlacementPicker from './PlayerPlacementPicker';

// ─── Module-level pick guard ──────────────────────────────────────────────────
// Lives OUTSIDE React's fiber system — no render cycle, no batching, no closures.
// This is the first and hardest gate. A module-level variable is set
// synchronously on the first click; any subsequent click that fires before
// React even begins processing will hit this gate and return immediately.
let _pickInFlight = false;
function acquirePickLock(): boolean {
  if (_pickInFlight) return false;
  _pickInFlight = true;
  return true;
}
function releasePickLock() { _pickInFlight = false; }

export default function GameContainer() {
  const loadIdRef = useRef(0);

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

  // Placement picker state
  const [playerToPlace, setPlayerToPlace] = useState<Player | null>(null);
  const [justPlacedSlotId, setJustPlacedSlotId] = useState<string | null>(null);
  // Track used team/era combos so they don't repeat.
  // The ref is kept in sync with the state so async handlers always read
  // the latest value without stale-closure bugs.
  const [usedEraIds, setUsedEraIds] = useState<Set<string>>(new Set());
  const usedEraIdsRef = useRef<Set<string>>(new Set());

  // ── Pick phase state machine ─────────────────────────────────────────────
  // 'idle'    → pool is live, cards are clickable
  // 'locked'  → pick in flight, pool shows skeleton (no clickable DOM nodes)
  // 'placing' → slot picker modal open, pool wiped
  // Transitions only happen through dedicated functions below.
  type PickPhase = 'idle' | 'locked' | 'placing';
  const [pickPhase, setPickPhase] = useState<PickPhase>('idle');

  // Only NFL has offense/defense split mode
  const sportHasModes = SPORT_CONFIG[sport].hasModes;

  const gspr = slots.length > 0 && team
    ? computeTeamGSPR(slots, sport, mode).gspr
    : 0;

  const filledRequired = slots.filter(s => s.required && s.player);
  const totalRequired = slots.filter(s => s.required);
  const isRosterFull = totalRequired.length > 0 && filledRequired.length === totalRequired.length;
  const openRequired = totalRequired.filter(s => !s.player);

  const loadPlayers = useCallback(async (s: Sport, teamId: string, eraId: string, expectedId?: number) => {
    setIsLoadingPlayers(true);
    setError(null);
    try {
      const res = await fetch(`/api/players/${s}?teamId=${encodeURIComponent(teamId)}&eraId=${encodeURIComponent(eraId)}`);
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

  const loadEra = useCallback(async (s: Sport, exclude?: Set<string>) => {
    const myId = ++loadIdRef.current;
    setIsLoadingEra(true);
    setError(null);
    setPlayers([]);
    setResults(null);
    setShowResults(false);
    setJustPlacedSlotId(null);
    setPlayerToPlace(null);
    try {
      const excludeParam = exclude && exclude.size > 0 ? `?exclude=${Array.from(exclude).join(',')}` : '';
      const res = await fetch(`/api/era/${s}${excludeParam}`);
      if (!res.ok) throw new Error('Failed to load era');
      const data: EraResponse = await res.json();
      if (myId !== loadIdRef.current) return;
      setEra(data.era);
      setTeam(data.team);
      const next1 = new Set([...Array.from(usedEraIdsRef.current), data.era.id]);
      usedEraIdsRef.current = next1;
      setUsedEraIds(next1);
      await loadPlayers(s, data.team.id, data.era.id, myId);
    } catch {
      if (myId === loadIdRef.current) setError('Failed to load game data. Please try again.');
    } finally {
      if (myId === loadIdRef.current) {
        setIsLoadingEra(false);
        releasePickLock();
        setPickPhase('idle');
      }
    }
  }, [loadPlayers]);

  // Load new era+team without clearing the existing roster.
  // Also resets the pick lock so the next pool is interactive.
  const loadNextPick = useCallback(async (s: Sport, exclude: Set<string>) => {
    const myId = ++loadIdRef.current;
    // Sync: clear pool and lock UI before first await
    setIsLoadingEra(true);
    setError(null);
    setPlayers([]);
    setJustPlacedSlotId(null);
    setPlayerToPlace(null);
    try {
      const excludeParam = exclude.size > 0 ? `?exclude=${Array.from(exclude).join(',')}` : '';
      const res = await fetch(`/api/era/${s}${excludeParam}`);
      if (!res.ok) throw new Error('Failed to load era');
      const data: EraResponse = await res.json();
      if (myId !== loadIdRef.current) return;
      setEra(data.era);
      setTeam(data.team);
      const next2 = new Set([...Array.from(usedEraIdsRef.current), data.era.id]);
      usedEraIdsRef.current = next2;
      setUsedEraIds(next2);
      // roster persists — only pool changes
      await loadPlayers(s, data.team.id, data.era.id, myId);
    } catch {
      if (myId === loadIdRef.current) setError('Failed to load next pick. Please try again.');
    } finally {
      if (myId === loadIdRef.current) {
        setIsLoadingEra(false);
        releasePickLock();
        setPickPhase('idle');
      }
    }
  }, [loadPlayers]);

  // Reset roster slots when sport or mode changes
  useEffect(() => {
    const templates = getRosterTemplates(sport, mode);
    setSlots(templates.map(t => ({ ...t, player: null })));
  }, [sport, mode]);

  // Load era on sport change
  useEffect(() => {
    setRerolls({ teamUsed: false, eraUsed: false, positionSwapUsed: false });
    usedEraIdsRef.current = new Set();
    setUsedEraIds(new Set());
    releasePickLock();
    setPickPhase('idle');
    loadEra(sport, new Set());
  }, [sport, loadEra]);

  const handleSportChange = (s: Sport) => {
    setSport(s);
    // Reset mode to combined when switching sports (only NFL uses modes)
    setMode('combined');
  };

  const handleModeChange = (m: DraftMode) => {
    setMode(m);
    setSlots(getRosterTemplates(sport, m).map(t => ({ ...t, player: null })));
  };

  // ── Pick flow ────────────────────────────────────────────────────────────────
  // Rule: one pick per era. The moment a player is clicked the ref flips to
  // true synchronously — before React re-renders — so a second click is
  // rejected even if the UI hasn't visually locked yet.

  const commitPickAndAdvance = (newSlots: typeof slots) => {
    setSlots(newSlots);
    setPlayerToPlace(null);
    setPlayers([]);
    const newFilled = newSlots.filter(s => s.required && s.player).length;
    const newTotal  = newSlots.filter(s => s.required).length;
    if (newFilled < newTotal) {
      loadNextPick(sport, usedEraIdsRef.current);
    } else {
      // Required roster full — release lock, go idle so user can remove/swap
      releasePickLock();
      setPickPhase('idle');
    }
  };

  // ── handleSelectPlayer ────────────────────────────────────────────────────
  // Three independent layers of protection against double-picks:
  //
  // 1. Module-level `_pickInFlight` — set synchronously before React touches
  //    anything. Completely outside React's fiber/reconciler. If two clicks
  //    somehow fire before any re-render, only the first acquires the lock.
  //
  // 2. flushSync — forces React to synchronously re-render and remove all
  //    player cards from the DOM before this function continues. Zero gap
  //    between click and cards disappearing.
  //
  // 3. pickPhase state machine — PlayerPool renders no clickable nodes when
  //    pickPhase !== 'idle', so even if a stale click event fires later it
  //    lands on a skeleton div, not a PlayerCard.
  const handleSelectPlayer = (player: Player) => {
    // Layer 1: module-level guard — fires before React does anything
    if (!acquirePickLock()) return;

    // Layer 2: flushSync — synchronously wipe cards from DOM right now
    flushSync(() => {
      setPlayers([]);
      setPickPhase('locked');
    });

    if (swapMode) {
      const newSlots = slots.map(s => s.id === swapMode.slotId ? { ...s, player } : s);
      setSwapMode(null);
      setJustPlacedSlotId(swapMode.slotId);
      commitPickAndAdvance(newSlots);
      return;
    }

    const compatible = slots.filter(s => {
      if (s.player) return false;
      return Array.isArray(s.position) ? s.position.includes(player.position) : s.position === player.position;
    });

    if (compatible.length === 1) {
      const newSlots = slots.map(s => s.id === compatible[0].id ? { ...s, player } : s);
      setJustPlacedSlotId(compatible[0].id);
      commitPickAndAdvance(newSlots);
      return;
    }

    if (compatible.length === 0) {
      setJustPlacedSlotId(null);
      loadNextPick(sport, usedEraIdsRef.current);
      return;
    }

    // Multiple compatible slots — show picker (pool already wiped synchronously)
    // Layer 3: pickPhase transitions to 'placing' — PlayerPool renders no cards
    setPickPhase('placing');
    setPlayerToPlace(player);
    setJustPlacedSlotId(null);
  };

  // Called by PlayerPlacementPicker when a slot is chosen
  const handlePlacePlayer = (player: Player, slotId: string) => {
    const newSlots = slots.map(s => s.id === slotId ? { ...s, player } : s);
    setJustPlacedSlotId(slotId);
    commitPickAndAdvance(newSlots);
  };

  // Called by PlayerPlacementPicker "Skip" — pick consumed, no placement
  const handleSkipPick = () => {
    setPlayerToPlace(null);
    setJustPlacedSlotId(null);
    setPickPhase('locked');
    loadNextPick(sport, usedEraIdsRef.current);
  };

  const handleRemovePlayer = (slotId: string) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, player: null } : s));
    if (justPlacedSlotId === slotId) setJustPlacedSlotId(null);
  };

  const handleTeamReroll = async () => {
    if (rerolls.teamUsed || !era) return;
    setRerolls(r => ({ ...r, teamUsed: true }));
    setIsLoadingEra(true);
    try {
      // Read ref for latest value — avoids stale-closure when called rapidly
      const currentUsed = usedEraIdsRef.current;
      const excludeParam = currentUsed.size > 0 ? `?exclude=${Array.from(currentUsed).join(',')}` : '';
      let newTeam = team;
      let newEra = era;
      for (let i = 0; i < 8; i++) {
        const res = await fetch(`/api/era/${sport}${excludeParam}`);
        const data: EraResponse = await res.json();
        if (data.team.id !== team?.id && !currentUsed.has(data.era.id)) {
          newTeam = data.team; newEra = data.era; break;
        }
      }
      if (newTeam && newTeam.id !== team?.id) {
        setTeam(newTeam);
        setEra(newEra);
        const next3 = new Set([...Array.from(usedEraIdsRef.current), newEra.id]);
        usedEraIdsRef.current = next3;
        setUsedEraIds(next3);
        // Preserve existing roster — only reload the player pool
        setPlayers([]);
        setJustPlacedSlotId(null);
        await loadPlayers(sport, newTeam.id, newEra.id);
      }
    } finally {
      setIsLoadingEra(false);
    }
  };

  const handleEraReroll = async () => {
    if (rerolls.eraUsed) return;
    setRerolls(r => ({ ...r, eraUsed: true }));
    // Preserve existing roster — only reload the era/player pool
    setJustPlacedSlotId(null);
    setPlayers([]);
    setIsLoadingEra(true);
    try {
      const currentUsed = usedEraIdsRef.current;
      const excludeParam = currentUsed.size > 0 ? `?exclude=${Array.from(currentUsed).join(',')}` : '';
      const res = await fetch(`/api/era/${sport}${excludeParam}`);
      if (!res.ok) throw new Error('Failed to load era');
      const data: EraResponse = await res.json();
      setEra(data.era);
      setTeam(data.team);
      const next4 = new Set([...Array.from(usedEraIdsRef.current), data.era.id]);
      usedEraIdsRef.current = next4;
      setUsedEraIds(next4);
      await loadPlayers(sport, data.team.id, data.era.id);
    } catch {
      setError('Era reroll failed. Please try again.');
    } finally {
      setIsLoadingEra(false);
    }
  };

  const handlePositionSwap = (slotId: string, position: Player['position'] | Player['position'][]) => {
    if (rerolls.positionSwapUsed) return;
    setRerolls(r => ({ ...r, positionSwapUsed: true }));
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
    setJustPlacedSlotId(null);
    setUsedEraIds(new Set());
    usedEraIdsRef.current = new Set();
    releasePickLock();
    setPickPhase('idle');
    loadEra(sport, new Set());
  };

  const selectedPlayerIds = new Set(slots.map(s => s.player?.id).filter(Boolean) as string[]);
  const cfg = SPORT_CONFIG[sport];

  // Positions the placement picker should highlight in the pool
  const highlightPositions = playerToPlace ? [playerToPlace.position] : null;

  // Pool is locked whenever we're not in 'idle' phase or are loading data
  const pickLocked = pickPhase !== 'idle' || isLoadingEra || isLoadingPlayers;

  return (
    <div className={`theme-${sport} min-h-screen`}>
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="font-black text-xl tracking-tight text-white">GOD SQUAD</span>
            <span className="text-xs text-gray-500 hidden sm:block">{cfg.tagline}</span>
          </div>
          <SportTabBar activeSport={sport} onChange={handleSportChange} />
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-200">✕</button>
          </div>
        )}

        {/* Era + Mode row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <EraCard era={era} team={team} isLoading={isLoadingEra} sport={sport} />
          {/* Only NFL has offense/defense modes */}
          {sportHasModes && (
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

        {/* Swap mode banner */}
        {swapMode && (
          <div className="mb-3 px-4 py-2 bg-yellow-950/60 border border-yellow-700 rounded-lg text-yellow-300 text-sm flex items-center gap-2">
            <span>🔄</span>
            <span>Position swap active — click a player to swap them in.</span>
            <button onClick={() => setSwapMode(null)} className="ml-auto text-yellow-400 hover:text-yellow-200 text-xs">Cancel</button>
          </div>
        )}

        {/* Player placed confirmation — auto-advances, just shows brief feedback */}
        {justPlacedSlotId && !isRosterFull && !isLoadingEra && !isLoadingPlayers && (
          <div className="mb-3 px-4 py-2.5 bg-green-950/50 border border-green-800/50 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
            <span className="text-green-400">✓</span>
            <span className="text-green-300">Player placed!</span>
            <span className="text-gray-500">
              {openRequired.length} slot{openRequired.length !== 1 ? 's' : ''} remaining — rolling next pick…
            </span>
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
            mode={mode}
            highlightPositions={highlightPositions}
            activePick={playerToPlace}
            pickLocked={pickLocked}
          />

          <div className="hidden lg:block bg-white/5" />

          {/* Team Roster */}
          <TeamRoster
            slots={slots}
            sport={sport}
            onRemove={handleRemovePlayer}
            onPositionSwap={handlePositionSwap}
            positionSwapUsed={rerolls.positionSwapUsed}
            justPlacedSlotId={justPlacedSlotId}
          />

          <div className="hidden lg:block bg-white/5" />

          {/* Power Meter + Simulate */}
          <div className="flex flex-col gap-4">
            <PowerMeter gspr={gspr} slots={slots} sport={sport} mode={mode} />

            <button
              onClick={handleSimulate}
              disabled={!isRosterFull || isSimulating}
              className={`
                w-full py-4 rounded-xl font-black text-lg tracking-wide uppercase
                transition-all duration-200
                ${isRosterFull && !isSimulating
                  ? 'text-white hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }
                ${isSimulating ? 'animate-pulse' : ''}
              `}
              style={isRosterFull && !isSimulating ? {
                background: `linear-gradient(135deg, ${cfg.primaryColor}, ${cfg.accentColor})`
              } : undefined}
            >
              {isSimulating ? 'Simulating...' : isRosterFull ? '⚡ Simulate Season' : 'Fill Roster to Simulate'}
            </button>

            <div className="text-center text-xs text-gray-600">
              {openRequired.length > 0
                ? `${openRequired.length} required slot${openRequired.length !== 1 ? 's' : ''} remaining`
                : slots.filter(s => !s.player).length > 0
                  ? `${slots.filter(s => !s.player).length} optional slots empty`
                  : '✓ Roster complete — ready to simulate!'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Placement picker overlay */}
      {playerToPlace && (
        <PlayerPlacementPicker
          player={playerToPlace}
          slots={slots}
          onPlace={handlePlacePlayer}
          onCancel={handleSkipPick}
        />
      )}

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
