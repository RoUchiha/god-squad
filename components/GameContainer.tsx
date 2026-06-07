'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  Sport, DraftMode, FilledRosterSlot, Player,
  PlayersResponse, SeasonResults,
  Era, HistoricalTeam, RerollState
} from '@/lib/types';
import { getRosterTemplates, SPORT_CONFIG } from '@/lib/constants';
import { computeTeamGSPR } from '@/lib/algorithms/powerRating';
import { buildEraQueue, rerollTeam, rerollEra, type EraQueueItem } from '@/lib/eraQueue';
import SportTabBar from './SportTabBar';
import EraCard from './EraCard';
import PlayerPool from './PlayerPool';
import TeamRoster from './TeamRoster';
import PowerMeter from './PowerMeter';
import RerollBar from './RerollBar';
import ModeSelector from './ModeSelector';
import SimulationModal from './SimulationModal';
import PlayerPlacementPicker from './PlayerPlacementPicker';

// ─────────────────────────────────────────────────────────────────────────────
// Pick phase — drives which UI is visible:
//   loading  → spinner in pool column, no interaction
//   ready    → PlayerPool shown (select → DRAFT button flow)
//   placing  → slot picker modal open, pool column blank
//   complete → roster full, simulate CTA active
// ─────────────────────────────────────────────────────────────────────────────
type PickPhase = 'loading' | 'ready' | 'placing' | 'complete';

export default function GameContainer() {
  const loadIdRef    = useRef(0);
  // Prevents handleDraft from firing more than once per pick — guards against
  // stale-closure double-calls even if PlayerPool's own ref somehow lets one through.
  const draftGuardRef = useRef(false);

  // ── Sport / mode ────────────────────────────────────────────────────────
  const [sport, setSport] = useState<Sport>('nba');
  const [mode, setMode] = useState<DraftMode>('combined');

  // ── Era queue — shuffled list of ALL team+era combos for this sport ─────
  // Each pick pops from the front. No API call needed for era selection.
  const [eraQueue, setEraQueue]   = useState<EraQueueItem[]>([]);
  const eraQueueRef               = useRef<EraQueueItem[]>([]);

  // ── Current pick ────────────────────────────────────────────────────────
  const [era,  setEra]  = useState<Era | null>(null);
  const [team, setTeam] = useState<HistoricalTeam | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  // ── Roster ──────────────────────────────────────────────────────────────
  const [slots, setSlots] = useState<FilledRosterSlot[]>([]);
  const [swapMode, setSwapMode] = useState<{ slotId: string; position: Player['position'] | Player['position'][] } | null>(null);
  const [justPlacedSlotId, setJustPlacedSlotId] = useState<string | null>(null);
  const [playerToPlace, setPlayerToPlace] = useState<Player | null>(null);

  // ── Pick phase ──────────────────────────────────────────────────────────
  const [pickPhase, setPickPhase] = useState<PickPhase>('loading');

  // ── Loading / error ─────────────────────────────────────────────────────
  const [isLoadingEra, setIsLoadingEra]         = useState(false);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isSimulating, setIsSimulating]         = useState(false);
  const [error, setError]                       = useState<string | null>(null);

  // ── Rerolls + results ───────────────────────────────────────────────────
  const [rerolls, setRerolls]       = useState<RerollState>({ teamUsed: false, eraUsed: false, positionSwapUsed: false });
  const [results, setResults]       = useState<SeasonResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  // ── Derived ─────────────────────────────────────────────────────────────
  const sportHasModes  = SPORT_CONFIG[sport].hasModes;
  const cfg            = SPORT_CONFIG[sport];
  const filledRequired = slots.filter(s => s.required && s.player);
  const totalRequired  = slots.filter(s => s.required);
  const isRosterFull   = totalRequired.length > 0 && filledRequired.length === totalRequired.length;
  const openRequired   = totalRequired.filter(s => !s.player);
  const gspr           = slots.length > 0 && team ? computeTeamGSPR(slots, sport, mode).gspr : 0;

  // ─────────────────────────────────────────────────────────────────────────
  // loadPlayers — fetches player data for current era (unchanged)
  // ─────────────────────────────────────────────────────────────────────────
  const loadPlayers = useCallback(async (
    s: Sport, teamId: string, eraId: string, expectedId?: number
  ) => {
    setIsLoadingPlayers(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/players/${s}?teamId=${encodeURIComponent(teamId)}&eraId=${encodeURIComponent(eraId)}`
      );
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

  // ─────────────────────────────────────────────────────────────────────────
  // advancePick — pops the next item from the era queue and loads its players.
  // This is the ONLY way a new pick begins. No randomness here; the queue
  // was shuffled once at game start.
  // ─────────────────────────────────────────────────────────────────────────
  // Reset draft guard only after pickPhase transitions to 'ready' in a React commit —
  // never synchronously inside advancePick, which would let a second handleDraft call
  // slip through in the same tick.
  useEffect(() => {
    if (pickPhase === 'ready') {
      draftGuardRef.current = false;
    }
  }, [pickPhase]);

  const advancePick = useCallback(async (queue: EraQueueItem[]) => {
    const myId = ++loadIdRef.current;
    setPickPhase('loading');
    setIsLoadingEra(true);
    setError(null);
    setPlayers([]);
    setJustPlacedSlotId(null);
    setPlayerToPlace(null);

    const next = queue[0];
    if (!next) {
      // Queue exhausted — cycle a fresh queue for the same sport
      const fresh = buildEraQueue(sport);
      eraQueueRef.current = fresh;
      setEraQueue(fresh);
      advancePick(fresh);
      return;
    }

    // Consume the item
    const remaining = queue.slice(1);
    eraQueueRef.current = remaining;
    setEraQueue(remaining);

    try {
      setEra(next.era);
      setTeam(next.team);
      await loadPlayers(sport, next.team.id, next.era.id, myId);
    } catch {
      if (myId === loadIdRef.current) setError('Failed to load players. Please try again.');
    } finally {
      if (myId === loadIdRef.current) {
        setIsLoadingEra(false);
        setPickPhase('ready');
      }
    }
  }, [sport, loadPlayers]);

  // ─────────────────────────────────────────────────────────────────────────
  // startGame — build a fresh queue and load the first pick
  // ─────────────────────────────────────────────────────────────────────────
  const startGame = useCallback((s: Sport) => {
    const queue = buildEraQueue(s);
    eraQueueRef.current = queue;
    setEraQueue(queue);
    advancePick(queue);
  }, [advancePick]);

  // ── Reset slots when sport/mode changes ─────────────────────────────────
  useEffect(() => {
    setSlots(getRosterTemplates(sport, mode).map(t => ({ ...t, player: null })));
  }, [sport, mode]);

  // ── Start game on sport change ───────────────────────────────────────────
  useEffect(() => {
    setRerolls({ teamUsed: false, eraUsed: false, positionSwapUsed: false });
    setResults(null);
    setShowResults(false);
    setPickPhase('loading');
    startGame(sport);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport]);

  // ─────────────────────────────────────────────────────────────────────────
  // commitPickAndAdvance — place player, then advance to next pick
  // ─────────────────────────────────────────────────────────────────────────
  const commitPickAndAdvance = useCallback((newSlots: FilledRosterSlot[]) => {
    setSlots(newSlots);
    setPlayerToPlace(null);
    setPlayers([]);

    const newFilled = newSlots.filter(s => s.required && s.player).length;
    const newTotal  = newSlots.filter(s => s.required).length;

    if (newFilled >= newTotal) {
      setPickPhase('complete');
    } else {
      advancePick(eraQueueRef.current);
    }
  }, [advancePick]);

  // ─────────────────────────────────────────────────────────────────────────
  // onDraft — called by PlayerPool DRAFT button (single entry point)
  // ─────────────────────────────────────────────────────────────────────────
  const handleDraft = useCallback((player: Player) => {
    // Hard gate — ref is synchronous, never stale, reset at start of each advancePick
    if (draftGuardRef.current) return;
    draftGuardRef.current = true;

    // Idempotency: player already in roster → skip to next pick instead of double-placing
    if (slots.some(s => s.player?.id === player.id)) {
      advancePick(eraQueueRef.current);
      return;
    }

    if (swapMode) {
      const newSlots = slots.map(s => s.id === swapMode.slotId ? { ...s, player } : s);
      setSwapMode(null);
      setJustPlacedSlotId(swapMode.slotId);
      commitPickAndAdvance(newSlots);
      return;
    }

    const compatible = slots.filter(s => {
      if (s.player) return false;
      return Array.isArray(s.position)
        ? s.position.includes(player.position)
        : s.position === player.position;
    });

    if (compatible.length === 1) {
      const newSlots = slots.map(s => s.id === compatible[0].id ? { ...s, player } : s);
      setJustPlacedSlotId(compatible[0].id);
      commitPickAndAdvance(newSlots);
      return;
    }

    if (compatible.length === 0) {
      // No compatible slot — skip placement, advance pick
      setJustPlacedSlotId(null);
      advancePick(eraQueueRef.current);
      return;
    }

    // Multiple compatible slots — show picker
    setPickPhase('placing');
    setPlayerToPlace(player);
    setJustPlacedSlotId(null);
  }, [slots, swapMode, commitPickAndAdvance, advancePick]);

  // onSkip — called by PlayerPool Skip button
  const handleSkip = useCallback(() => {
    setJustPlacedSlotId(null);
    advancePick(eraQueueRef.current);
  }, [advancePick]);

  // Placement picker: slot chosen (draftGuard was already set by handleDraft; keep it locked until advancePick resets it)
  const handlePlacePlayer = useCallback((player: Player, slotId: string) => {
    const newSlots = slots.map(s => s.id === slotId ? { ...s, player } : s);
    setJustPlacedSlotId(slotId);
    commitPickAndAdvance(newSlots);
  }, [slots, commitPickAndAdvance]);

  // Placement picker: skip
  const handleSkipPlacement = useCallback(() => {
    setPlayerToPlace(null);
    setJustPlacedSlotId(null);
    advancePick(eraQueueRef.current);
  }, [advancePick]);

  // ─────────────────────────────────────────────────────────────────────────
  // Rerolls — pull from the remaining queue instead of calling the era API
  // ─────────────────────────────────────────────────────────────────────────
  const handleTeamReroll = useCallback(async () => {
    if (rerolls.teamUsed || !team) return;
    setRerolls(r => ({ ...r, teamUsed: true }));

    const result = rerollTeam(eraQueueRef.current, team.id);
    if (!result) return; // no alternative team left — do nothing
    eraQueueRef.current = result.newQueue;
    setEraQueue(result.newQueue);

    const myId = ++loadIdRef.current;
    setIsLoadingEra(true);
    setPlayers([]);
    setJustPlacedSlotId(null);
    try {
      setEra(result.item.era);
      setTeam(result.item.team);
      await loadPlayers(sport, result.item.team.id, result.item.era.id, myId);
    } finally {
      if (myId === loadIdRef.current) setIsLoadingEra(false);
    }
  }, [rerolls.teamUsed, team, sport, loadPlayers]);

  const handleEraReroll = useCallback(async () => {
    if (rerolls.eraUsed || !era) return;
    setRerolls(r => ({ ...r, eraUsed: true }));

    const result = rerollEra(eraQueueRef.current, era.id);
    if (!result) return;
    eraQueueRef.current = result.newQueue;
    setEraQueue(result.newQueue);

    const myId = ++loadIdRef.current;
    setIsLoadingEra(true);
    setPlayers([]);
    setJustPlacedSlotId(null);
    try {
      setEra(result.item.era);
      setTeam(result.item.team);
      await loadPlayers(sport, result.item.team.id, result.item.era.id, myId);
    } finally {
      if (myId === loadIdRef.current) setIsLoadingEra(false);
    }
  }, [rerolls.eraUsed, era, sport, loadPlayers]);

  const handlePositionSwap = useCallback((slotId: string, position: Player['position'] | Player['position'][]) => {
    if (rerolls.positionSwapUsed) return;
    setRerolls(r => ({ ...r, positionSwapUsed: true }));
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, player: null } : s));
    setSwapMode({ slotId, position });
  }, [rerolls.positionSwapUsed]);

  const handleRemovePlayer = useCallback((slotId: string) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, player: null } : s));
    if (justPlacedSlotId === slotId) setJustPlacedSlotId(null);
  }, [justPlacedSlotId]);

  const handleSportChange = (s: Sport) => {
    setSport(s);
    setMode('combined');
  };

  const handleModeChange = (m: DraftMode) => {
    setMode(m);
    setSlots(getRosterTemplates(sport, m).map(t => ({ ...t, player: null })));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Simulate
  // ─────────────────────────────────────────────────────────────────────────
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
    setSwapMode(null);
    setPickPhase('loading');
    startGame(sport);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
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
          {sportHasModes && <ModeSelector mode={mode} onChange={handleModeChange} />}
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
            <span>Position swap active — select a player to swap them in.</span>
            <button onClick={() => setSwapMode(null)} className="ml-auto text-yellow-400 hover:text-yellow-200 text-xs">Cancel</button>
          </div>
        )}

        {/* Player placed confirmation */}
        {justPlacedSlotId && !isRosterFull && pickPhase === 'loading' && (
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

          {/* ── Pool column ──────────────────────────────────────────────── */}
          {pickPhase === 'ready' ? (
            /*
             * PlayerPool ONLY exists in the DOM when phase === 'ready'.
             * key={era?.id} forces a full React remount for each new era —
             * previous selection state, event listeners, and draftFired
             * flag are completely gone before new cards are shown.
             */
            <PlayerPool
              key={`${era?.id}-${team?.id}`}
              players={players}
              isLoading={isLoadingPlayers}
              sport={sport}
              mode={mode}
              onDraft={handleDraft}
              onSkip={handleSkip}
            />
          ) : (
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Player Pool</h2>
              {pickPhase === 'loading' && (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Rolling next pick…</p>
                </div>
              )}
              {pickPhase === 'placing' && (
                <div className="flex flex-col items-center justify-center gap-2 py-16">
                  <p className="text-sm text-gray-500">Choose a slot for {playerToPlace?.name}</p>
                </div>
              )}
              {pickPhase === 'complete' && (
                <div className="flex flex-col items-center justify-center gap-2 py-16">
                  <p className="text-sm text-green-400 font-semibold">✓ Roster complete</p>
                  <p className="text-xs text-gray-500">Simulate your season →</p>
                </div>
              )}
            </div>
          )}

          <div className="hidden lg:block bg-white/5" />

          {/* ── Roster column ────────────────────────────────────────────── */}
          <TeamRoster
            slots={slots}
            sport={sport}
            onRemove={handleRemovePlayer}
            onPositionSwap={handlePositionSwap}
            positionSwapUsed={rerolls.positionSwapUsed}
            justPlacedSlotId={justPlacedSlotId}
          />

          <div className="hidden lg:block bg-white/5" />

          {/* ── Power + Simulate ─────────────────────────────────────────── */}
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
      {pickPhase === 'placing' && playerToPlace && (
        <PlayerPlacementPicker
          player={playerToPlace}
          slots={slots}
          onPlace={handlePlacePlayer}
          onCancel={handleSkipPlacement}
        />
      )}

      {/* Results modal */}
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
