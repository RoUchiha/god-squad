# God Squad — Context File for Future AI Chats

Paste this file at the start of any new conversation to give full project context.

---

## Project Summary
**God Squad** is a sports team-building browser game at `god-squad/` in the Documents repo.
Players draft historical athletes from a randomly assigned era+team combo, then simulate
a full professional season to try to go undefeated (82-0, 17-0, 162-0, or 82-0 depending on sport).

Inspired by 82-0.com and 20-0.com.

## Tech Stack
- **Next.js 14** App Router, TypeScript, Tailwind CSS v3
- **Zod** for runtime validation on all API routes
- **No database** — game state is client-side only
- Port: `3001` (to avoid conflicts with other projects on 3000)

## File Structure
```
god-squad/
├── SPEC.md              Full product specification
├── CONTEXT.md           This file
├── README.md
├── .env.example         API keys reference
├── app/
│   ├── page.tsx         Renders <GameContainer />
│   ├── layout.tsx       Root layout + metadata
│   ├── globals.css      Tailwind + sport theme CSS vars
│   └── api/
│       ├── era/[sport]/route.ts       Returns random era+team
│       ├── players/[sport]/route.ts   Returns player pool (fetches from sports APIs)
│       └── simulate/route.ts          POST — runs season simulation
├── components/
│   ├── GameContainer.tsx    All game state lives here (useState/useCallback)
│   ├── SportTabBar.tsx      NBA/NFL/MLB/NHL tab navigation
│   ├── EraCard.tsx          Shows current era + team info
│   ├── PlayerPool.tsx       Scrollable list of available players
│   ├── PlayerCard.tsx       Individual player display with key stats
│   ├── TeamRoster.tsx       Selected team roster slots
│   ├── PowerMeter.tsx       GSPR visualization + undefeated % estimate
│   ├── RerollBar.tsx        Team/Era/Position swap reroll buttons
│   ├── ModeSelector.tsx     Offense / Defense / Combined mode picker
│   └── SimulationModal.tsx  Full-screen results overlay
└── lib/
    ├── types.ts             All TypeScript types
    ├── constants.ts         Sport configs, roster templates, era data
    ├── utils.ts             Helpers (clamp, normalize, cn, etc.)
    ├── algorithms/
    │   ├── powerRating.ts   computePlayerScore(), computeTeamGSPR()
    │   └── simulator.ts     simulateSeason(), getBaseWinProbability()
    └── sports/
        ├── mlb.ts           MLB Stats API (free, no key)
        ├── nhl.ts           NHL API (free, no key)
        ├── nba.ts           BallDontLie API (free tier, needs BALLDONTLIE_API_KEY)
        └── nfl.ts           ESPN unofficial API (no key)
```

## Key Architecture Decisions
- **All API keys are server-side only** — stored in `.env.local`, used in `app/api/` routes
- **Input validation**: every API route validates params with Zod before any external call
- **Fallback data**: if external sports APIs fail, each `lib/sports/*.ts` generates plausible placeholder data so the game always works
- **No auth/database** — the game is stateless; no user accounts needed
- **GSPR algorithm**: in `lib/algorithms/powerRating.ts`. Uses era-normalized z-scores per stat, weighted by position. Scale 0–1000.
- **Season simulation**: in `lib/algorithms/simulator.ts`. Uses a power curve formula for win probability per game, with per-game variance. Calibrated so undefeated is ~5-25% at max GSPR.

## GSPR Formula (overview)
```
GSPR = (offScore × weight + defScore × weight + depthScore × 0.10 + chemistry × 0.05) × 10

Sport weights:
  NBA: offense 55%, defense 35%
  NFL: offense 45%, defense 45%
  MLB: offense 50%, pitching 40%
  NHL: offense 50%, defense 30% (+ goalie in defense bucket)

Scale: 0–1000
Tiers: Average (0–499), Good (500–699), Great (700–849), Legendary (850–949), God Squad (950+)
```

## Win Probability Formula
```typescript
winProb = base + range × (gspr/1000)^1.8

NBA: base=0.620, range=0.365  → max 0.985 at GSPR 1000
NFL: base=0.580, range=0.330  → max 0.910
MLB: base=0.560, range=0.432  → max 0.992
NHL: base=0.600, range=0.382  → max 0.982
```

## Sports APIs Used
| Sport | URL | Auth | Notes |
|-------|-----|------|-------|
| MLB | statsapi.mlb.com/api/v1 | None | Official, historical back to 1876 |
| NHL | api-web.nhle.com/v1 | None | Official |
| NBA | api.balldontlie.io/v1 | Free API key | `BALLDONTLIE_API_KEY` env var |
| NFL | site.api.espn.com/... | None | Unofficial ESPN API |

## Eras Defined (in lib/constants.ts)
Each sport has 6 eras defined as static data. The API routes pick one randomly.
Era selection is done in `/api/era/[sport]` — it returns a random era + random team.

## Reroll System
Each game has exactly 3 one-time-use rerolls:
1. **Team Reroll** — same era, different team, clears drafted players
2. **Era Reroll** — completely new random era + team, clears everything
3. **Position Swap** — click a roster slot then pick a replacement from pool

## Roster Sizes
- NBA: 8 (5 starters + 3 bench)
- NFL Combined: 15 (7 offense + 8 defense)
- NFL Offense only: 7 | Defense only: 8
- MLB Combined: 13 (9 batters + 4 pitchers)
- NHL Combined: 9 (6 forwards + 2 D + 1 G)

## Environment Variables
```
BALLDONTLIE_API_KEY=   # Required for NBA live data (free signup)
RATE_LIMIT_SECRET=     # Optional, for enhanced rate limiting
NEXT_PUBLIC_APP_URL=   # For CORS in production
```

## Deployment
Vercel (free tier), connect GitHub repo, set env vars in dashboard.
Custom domain via Vercel: set DNS CNAME to cname.vercel-dns.com

## Known Limitations / Future Work
- NFL historical stats (pre-2000) use generated fallback data; ESPN API covers modern seasons
- NHL historical stats (pre-2010) may need fallback data
- No user accounts or leaderboard yet
- Could add: share results link, leaderboard, more sports (MLS, WNBA)
- Rate limiting is in-memory (resets on server restart) — use Upstash Redis for production

## Commands
```bash
cd god-squad
npm install
npm run dev          # localhost:3001
npm run build        # production build
npm run typecheck    # TypeScript check
```
