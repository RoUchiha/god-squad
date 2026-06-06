# God Squad — Full Product Specification

## Overview
God Squad is a fantasy sports team-building game where the objective is to assemble the greatest team possible from a randomly selected historical era and franchise, then simulate a full professional sports season and attempt to go undefeated.

Inspired by 82-0.com and 20-0.com, the game celebrates the "what-if" fantasies of sports debates: Could the 1996 Bulls go 82-0? Could the 1927 Yankees go 162-0?

---

## Sports Supported (Phase 1)
- **NBA** (Basketball) — 82-game season
- **NFL** (American Football) — 17-game season
- **MLB** (Baseball) — 162-game season
- **NHL** (Ice Hockey) — 82-game season

---

## Game Flow

### 1. Sport Selection
User selects a sport via tab navigation. Each tab has a sport-specific visual theme.

### 2. Era + Team Generation (Automatic)
System randomly selects:
- A **5-year era** from within the sport's tracked history
- A **franchise** that existed during that era
- Displayed prominently with the team's primary colors/identity

### 3. Draft Mode Selection (where applicable)
- **NFL / MLB / NHL**: Offense Only | Defense Only | Combined
- **NBA**: Full Team only (both ends of court always relevant)
- In "Combined" mode, offense is drafted first, then defense

### 4. Player Pool Display
System fetches the **top 20–25 players** for the selected team/era combo, sorted by position-adjusted performance score.

Each player card shows:
- Name, position, years with team
- 3–5 most relevant stats for that sport
- Individual power score (0–100)

### 5. Team Building
User clicks players to fill roster slots:
- **NBA**: PG, SG, SF, PF, C, + 3 bench spots (8 total)
- **NFL Combined**: QB, RB, WR×3, TE, K | DE×2, DT, LB×2, CB×2, S (15 total)
- **NFL Offense**: QB, RB, WR×3, TE, K (7 total)
- **NFL Defense**: DE×2, DT, LB×2, CB×2, S (8 total)
- **MLB Combined**: C, 1B, 2B, 3B, SS, LF, CF, RF, DH | SP×2, CL, RP (13 total)
- **NHL Combined**: C×2, LW×2, RW×2, D×2, G (9 total)

Position validation: Players can only fill their natural positions (with some flexibility for similar positions).

**No duplicate players allowed.** Once a player is selected, they are removed from the pool.

### 6. GSPR (God Squad Power Rating)
Live-updating score (0–1000) calculated from selected players.

Formula:
```
GSPR = (
  OffenseScore   × offense_weight[sport] +
  DefenseScore   × defense_weight[sport] +
  DepthScore     × 0.10 +
  ChemistryBonus × 0.05
) × 10

Where each score component is 0–100.
```

Displayed as a stylized power meter with color coding:
- 0–499: Gray (Average)
- 500–699: Blue (Good)
- 700–849: Purple (Great)
- 850–949: Gold (Legendary)
- 950–1000: Red (God Squad)

### 7. Rerolls (One-time use each)
- **Team Reroll**: Keep the era, get a new random team
- **Era Reroll**: Completely reset — new era AND new team
- **Position Swap**: Swap any one drafted player for a different player at the same position from the pool

### 8. Season Simulation
User clicks "SIMULATE SEASON" once roster is fully filled.

Algorithm:
1. Compute final GSPR
2. For each game in the season:
   - Generate opponent strength (normal distribution centered on era-average)
   - Apply per-game random variance ("any given Sunday" effect)
   - Calculate win probability via logistic function
   - Determine game result
3. Aggregate win/loss record
4. Calculate playoff run (if applicable)

Going undefeated:
- Requires sustained dominance across a full season
- Target probabilities at max GSPR (~1000):
  - NFL (17 games): ~25–30%
  - NBA (82 games): ~20–25%
  - NHL (82 games): ~18–22%
  - MLB (162 games): ~8–12%
- At GSPR 900: roughly half the above probability
- At GSPR 700: less than 1% for any sport

### 9. Results Display
Full season record (W-L), GSPR score, achievement tier, and descriptive outcome text.
Special animation/overlay for an undefeated season.

---

## God Squad Power Rating Algorithm (GSPR)

### Player Individual Score
For each player, compute an **era-adjusted contribution score** (0–100):

```
playerScore = Σ (statValue - eraMean[stat]) / eraStdDev[stat] × statWeight[position][stat]
            = z-score weighted sum
            ∈ [0, 100] after sigmoid normalization
```

Special multipliers:
- Verifiable Hall of Famer / GOAT-tier: ×1.15
- All-Star/Pro-Bowl caliber: ×1.08
- Solid starter: ×1.00
- Bench player: ×0.92

### Sport Weights
```
NBA:    offense 55%, defense 35%, depth 10%
NFL:    offense 45%, defense 45%, depth 10%
MLB:    offense 50%, pitching 40%, depth 10%
NHL:    forwards 45%, defense 35%, goalie 20%
```

### Depth Score
Bonus based on roster completeness:
- All required positions filled: 100
- 1 slot empty: 75
- 2+ slots empty: proportionally lower

### Chemistry Bonus (0–10 points)
Awarded for historically significant combinations:
- Two+ players who won championships together
- Historic dynasty core (e.g., Jordan + Pippen)
- Positional intangibles

---

## Season Simulation Algorithm

### Win Probability Per Game
```
baseWinProb = f(GSPR) where:
  f(x) = minWinProb[sport] + range[sport] × (x/1000)^1.8

Sport calibration:
  NBA: min=0.62, range=0.365  → at 1000: 0.985
  NFL: min=0.58, range=0.330  → at 1000: 0.910
  MLB: min=0.56, range=0.432  → at 1000: 0.992
  NHL: min=0.60, range=0.382  → at 1000: 0.982
```

### Per-Game Variance
Each game rolls:
1. **Performance variance** ∈ [-0.04, +0.04] (hot/cold game)
2. **Opponent variance** ∈ [-0.03, +0.06] (opponent plays above/below their level)
3. Final win prob = clamp(baseWinProb + variance - opponentBoost, 0.05, 0.995)

### Season Games
- NBA: 82 regular season games
- NFL: 17 regular season games
- MLB: 162 regular season games
- NHL: 82 regular season games

---

## API Data Sources

| Sport | Primary API | Auth Required |
|-------|-------------|---------------|
| MLB | statsapi.mlb.com | No (free, official) |
| NHL | api-web.nhle.com | No (free, official) |
| NBA | api.balldontlie.io | Yes (free API key) |
| NFL | site.api.espn.com | No (unofficial) |

All API calls are **server-side only** (Next.js API routes). No API keys are ever exposed to the client.

---

## Security Requirements (Enterprise Standards)

1. **API Key Protection**: All secrets in environment variables, server-side only
2. **Input Validation**: All route parameters validated against enum allowlist
3. **Rate Limiting**: API routes rate-limited via in-memory store (or Upstash Redis)
4. **CORS**: Locked to app domain in production
5. **Security Headers**: X-Frame-Options, X-Content-Type-Options, HSTS, CSP
6. **No Stack Traces**: Production errors never expose internal details
7. **Request Sanitization**: All external API params sanitized before forwarding

---

## Visual Design

### Overall Theme
- Dark background (#0a0a0a to #1a1a2e)
- Minimalist card-based layout
- Smooth transitions and micro-animations
- Sport-specific accent colors per tab

### Sport Color Themes
| Sport | Primary | Accent | Background Tint |
|-------|---------|--------|-----------------|
| NBA | #F26522 | #1D1D1D | #1a0f00 |
| NFL | #013369 | #D50A0A | #000818 |
| MLB | #002D72 | #E31837 | #000A1A |
| NHL | #003087 | #FCB514 | #001020 |

### Responsive
- Desktop: 3-column layout (era info | player pool | roster builder)
- Tablet: 2-column (pool | roster)
- Mobile: Stacked single column

---

## File Structure

```
god-squad/
├── SPEC.md
├── CONTEXT.md
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       ├── era/[sport]/route.ts
│       ├── players/[sport]/route.ts
│       └── simulate/route.ts
├── components/
│   ├── GameContainer.tsx
│   ├── SportTabBar.tsx
│   ├── EraCard.tsx
│   ├── PlayerPool.tsx
│   ├── PlayerCard.tsx
│   ├── TeamRoster.tsx
│   ├── RosterSlot.tsx
│   ├── PowerMeter.tsx
│   ├── RerollBar.tsx
│   ├── ModeSelector.tsx
│   └── SimulationModal.tsx
└── lib/
    ├── types.ts
    ├── constants.ts
    ├── utils.ts
    ├── algorithms/
    │   ├── powerRating.ts
    │   └── simulator.ts
    └── sports/
        ├── mlb.ts
        ├── nhl.ts
        ├── nba.ts
        └── nfl.ts
```

---

## Deployment

- **Platform**: Vercel (free tier)
- **Domain**: godsquad.gg or similar (custom domain via Vercel)
- **Environment Variables**: Set in Vercel dashboard, never in code
- **CI/CD**: Auto-deploy on push to main via GitHub integration
