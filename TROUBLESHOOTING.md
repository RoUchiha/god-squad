# God Squad — Multi-Pick Bug: Troubleshooting Context

## The Problem

Players can be drafted multiple times from the same era pool. Confirmed via live test:
- Tony Edwards appeared **twice** in the DOM after one era
- The placement picker ("Choose a slot for Tony Edwards") was open **AND** Tony was already placed in the C slot simultaneously
- This means `onDraft(player)` fired more than once for a single era

## Repo / Stack

- **Repo**: https://github.com/RoUchiha/god-squad
- **Live**: Vercel (auto-deploys from `main`)
- **Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS v3
- **Local dev**: `npm run dev` → `localhost:3001`

---

## Architecture of the Draft Flow

### Key files
| File | Role |
|------|------|
| `components/GameContainer.tsx` | Top-level state machine. Owns `slots`, `pickPhase`, `eraQueue`. |
| `components/PlayerPool.tsx` | Shows player cards + DRAFT/Skip buttons. Calls `onDraft(player)`. |
| `components/PlayerPlacementPicker.tsx` | Modal shown when multiple slots are compatible. |
| `lib/eraQueue.ts` | `buildEraQueue(sport)` → Fisher-Yates shuffle of ALL team+era combos. |
| `lib/constants.ts` | `getRosterTemplates()`, `NBA_ROSTER`, etc. |

### Pick phase state machine
```
'loading' → 'ready' → (user picks) → 'placing' | 'loading'
                                         ↓
                                    slot chosen → 'loading' → 'ready' → ...
```
- `pickPhase === 'ready'` → PlayerPool is in the DOM
- `pickPhase === 'loading'` → PlayerPool unmounted (spinner shown)
- `pickPhase === 'placing'` → Placement picker modal open, PlayerPool NOT rendered

### NBA Roster (the problematic case)
```typescript
NBA_ROSTER = [
  { id: 'pg',   position: 'PG' },
  { id: 'sg',   position: 'SG' },
  { id: 'sf',   position: 'SF' },
  { id: 'pf',   position: 'PF' },
  { id: 'c',    position: 'C'  },
  { id: '6man', position: ['PG','SG','SF','PF','C'] },  // ← flex slot
]
```

For a PG (e.g. Tony Edwards), `compatible.length === 2` (pg + 6man) → placement picker opens.

---

## Root Cause Analysis

### `handleDraft` in GameContainer (the real problem)

```typescript
// GameContainer.tsx
const handleDraft = useCallback((player: Player) => {
  // captures `slots` from closure — stale if called twice before re-render
  const compatible = slots.filter(s => {
    if (s.player) return false;
    return Array.isArray(s.position)
      ? s.position.includes(player.position)
      : s.position === player.position;
  });

  if (compatible.length === 1) {
    const newSlots = slots.map(s => s.id === compatible[0].id ? { ...s, player } : s);
    commitPickAndAdvance(newSlots);  // advances era, unmounts pool
    return;
  }

  // Multiple compatible slots → show placement picker
  setPickPhase('placing');
  setPlayerToPlace(player);
}, [slots, swapMode, commitPickAndAdvance, advancePick]);
```

**If `handleDraft` is called twice before React re-renders:**
- Both calls see the same stale `slots` (no player placed yet)
- Call 1: compatible = [C, 6man] → `setPickPhase('placing')`
- Call 2: compatible = [C, 6man] → `setPickPhase('placing')` again (or worse, first call auto-placed, second call sees one slot filled and auto-places in the other)

### Why guards keep failing

**Attempt 1**: `useState` in PlayerPool (`draftFired`)
- **Why it failed**: `draftFired` is captured by the `useCallback` closure. Both rapid clicks see `draftFired === false` before React re-renders.

**Attempt 2**: `useRef` in PlayerPool (`draftFiredRef`)
```typescript
const draftFiredRef = useRef(false);
const handleDraft = useCallback(() => {
  if (!selected || draftFiredRef.current) return;
  draftFiredRef.current = true;
  onDraft(selected);
}, [selected, onDraft]);
```
- **Why it failed**: This only guards the PlayerPool layer. The `onDraft` prop itself (`handleDraft` in GameContainer) still has stale closures.

**Attempt 3**: `draftGuardRef` + idempotency check in GameContainer
```typescript
const draftGuardRef = useRef(false);
const handleDraft = useCallback((player: Player) => {
  if (draftGuardRef.current) return;
  draftGuardRef.current = true;
  if (slots.some(s => s.player?.id === player.id)) { advancePick(...); return; }
  // ...
}, [slots, ...]);
```
Reset in `advancePick`: `draftGuardRef.current = false`
- **Status**: Committed and pushed. User reports still broken.

---

## What's Suspected But Not Confirmed

The `draftGuardRef` fix in GameContainer **should** work in theory. If it's still failing, one of these is true:

1. **The guard is being bypassed** — `advancePick` resets `draftGuardRef.current = false` synchronously at the top of the function. If two calls to `handleDraft` happen, the first sets it to `true`, calls `advancePick`, which immediately resets it to `false` — and NOW the second call can pass. This is the most likely remaining bug.

   **Fix**: Don't reset in `advancePick`. Instead reset when `pickPhase` transitions to `'ready'` (i.e., in a `useEffect`).

2. **React StrictMode double-invocation** — In dev, React invokes some hooks twice. Could affect ref initialization.

3. **The problem is not a double-click** — The user might be experiencing something entirely different. Possible: after a placement, the pick advances but the OLD PlayerPool briefly flashes back (due to `key={era?.id}` not changing immediately), allowing a second selection from the same pool.

---

## Current State of Key Files

### `components/PlayerPool.tsx` (current)
```typescript
import { useState, useCallback, useRef } from 'react';

export default function PlayerPool({ players, isLoading, sport, mode, onDraft, onSkip }: Props) {
  const [selected, setSelected] = useState<Player | null>(null);
  const [draftFired, setDraftFired] = useState(false);
  const draftFiredRef = useRef(false);

  const handleCardClick = useCallback((player: Player) => {
    if (draftFiredRef.current) return;
    setSelected(prev => prev?.id === player.id ? null : player);
  }, []);

  const handleDraft = useCallback(() => {
    if (!selected || draftFiredRef.current) return;
    draftFiredRef.current = true;
    setDraftFired(true);
    onDraft(selected);
  }, [selected, onDraft]);

  const handleSkip = useCallback(() => {
    if (draftFiredRef.current) return;
    draftFiredRef.current = true;
    setDraftFired(true);
    onSkip();
  }, [onSkip]);
  // ... render
}
```

### `components/GameContainer.tsx` — relevant section (current)
```typescript
const loadIdRef    = useRef(0);
const draftGuardRef = useRef(false);

const advancePick = useCallback(async (queue: EraQueueItem[]) => {
  draftGuardRef.current = false;  // ← PROBLEM: resets immediately, before async work
  const myId = ++loadIdRef.current;
  setPickPhase('loading');
  // ... fetch players, setPickPhase('ready')
}, [sport, loadPlayers]);

const handleDraft = useCallback((player: Player) => {
  if (draftGuardRef.current) return;
  draftGuardRef.current = true;
  if (slots.some(s => s.player?.id === player.id)) { advancePick(eraQueueRef.current); return; }
  // ...
}, [slots, swapMode, commitPickAndAdvance, advancePick]);
```

---

## Recommended Fix for New Session

The `draftGuardRef.current = false` reset at the top of `advancePick` is **too early** — it resets synchronously during the same tick that `handleDraft` fires, so a second call to `handleDraft` can slip through after the reset.

**The fix**: Move the reset to a `useEffect` that watches `pickPhase`:

```typescript
// Reset draft guard only when a new era is fully ready for picks
useEffect(() => {
  if (pickPhase === 'ready') {
    draftGuardRef.current = false;
  }
}, [pickPhase]);
```

Remove the `draftGuardRef.current = false` line from `advancePick`.

This ensures the guard is only cleared AFTER `pickPhase` has transitioned to `'ready'` in a React commit, which is strictly AFTER the previous pick cycle completed and React has re-rendered.

**Additionally**, consider whether the `key={era?.id}` remounting strategy is working. If two consecutive eras have the same ID, PlayerPool does NOT remount and `draftFiredRef` stays `true` from the previous pick (making it impossible to draft). Verify era IDs are always unique per pick.

---

## Test Evidence (from previous session)

```javascript
// Injected test via preview MCP:
const tonyEls = [...document.querySelectorAll('*')]
  .filter(el => el.textContent?.includes('Tony Edwards') && el.children.length < 3);
{ tonyCount: 2 }

tonyPositions[0]: "LAYER POOL\n\nChoose a slot for Tony Edwards\n\nYOUR ROSTER\nOFFE"
// ^ placement picker open for Tony
tonyPositions[1]: "6 required slots remaining\nC\nTony Edwards\n2015–2019\n82\nPLAC"
// ^ Tony already placed in C slot
```

Tony Edwards (PG) was placed in the C slot (auto-place, compatible.length === 1 for C specifically)
AND the placement picker opened for him. This means `handleDraft` fired twice with different slot availability — impossible unless the two calls saw different `slots` state OR one fired before the roster update committed.

---

## Other Bugs Fixed (Do Not Reintroduce)

- **Era queue**: `lib/eraQueue.ts` — Fisher-Yates shuffle of ALL ~330 NBA combos. Eliminates birthday-paradox repeats. Do not replace with random API selection.
- **Era loop**: `lib/constants.ts` — era generation loop goes to 2025 (was 2020). Fixes SEA Kraken and other recent expansion teams having zero eras.
- **NHL teams**: `lib/sports/nhl.ts` — 32 teams including ANA Ducks and ARI Coyotes.
- **94 tests pass**: `npm test` — all passing. Keep them passing.
