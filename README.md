# ⚡ God Squad

> Build a team from a random historical era. Simulate a full season. Can you go undefeated?

**[▶ Play Live Demo → god-squad.vercel.app](https://god-squad.vercel.app)**

Inspired by [82-0.com](https://82-0.com) and [20-0.com](https://20-0.com).

## Sports Supported
- 🏀 **NBA** — Can your squad go 82-0?
- 🏈 **NFL** — Can your squad go 17-0?
- ⚾ **MLB** — Can your squad go 162-0?
- 🏒 **NHL** — Can your squad go 82-0?
- ⚽ **Premier League** — Can your squad go unbeaten?
- 🌍 **World Cup** — Can your squad win all 7 games?

## How to Play
1. Select a sport tab
2. A random **historical era** (5-year window) and **team** are chosen for you
3. Browse the player pool — click players to add them to your roster
4. Use your **rerolls** wisely: Team Swap, Era Reroll, Position Swap (one each)
5. Fill all required slots, then hit **Simulate Season**
6. See your final W-L record and whether you achieved the **God Squad** status

## God Squad Power Rating (GSPR)
A 0–1000 proprietary power score based on:
- **Offense** (55–50% depending on sport)
- **Defense** (35–45%)
- **Depth** (10%)
- **Chemistry bonuses** for historic duos

Going undefeated requires sustained excellence — at max GSPR (~1000), your chances are ~8–30% depending on sport. The NBA's 82-game gauntlet is far harder than the NFL's 17 games.

## Local Development

```bash
cd god-squad
npm install
cp .env.example .env.local
# Fill in BALLDONTLIE_API_KEY (free at balldontlie.io) for NBA data
npm run dev
# App runs at http://localhost:3001
```

## Deployment (Vercel)
1. Push to GitHub
2. Import repo at vercel.com
3. Add env variables from `.env.example` in Vercel dashboard
4. Connect your custom domain

## Security
- All API keys stored server-side only (Next.js API routes)
- Input validation with Zod on all endpoints
- Security headers configured (CSP, X-Frame-Options, etc.)
- No secrets ever reach the client

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript** + strict mode
- **Tailwind CSS** v3
- **Framer Motion** for animations
- **Zod** for runtime validation
- MLB Stats API (free, no key)
- NHL API (free, no key)
- BallDontLie NBA API (free tier)
- ESPN unofficial API (NFL)
