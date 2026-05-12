# Arc Academy

A Web3 education platform on Arc testnet where users connect their wallet, read official docs, take quizzes, earn points, and mint NFT certificates as on-chain proof of completion.

## Run & Operate

- `pnpm --filter @workspace/arc-academy run dev` — run the frontend (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Zustand (persisted state)
- Fonts: Inter + Orbitron (Google Fonts)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (available, not yet wired to frontend)
- Wallet: MetaMask / window.ethereum (Arc testnet ready)

## Where things live

- `artifacts/arc-academy/src/data/quizzes.ts` — all 5 quiz modules, questions, and doc links (source of truth)
- `artifacts/arc-academy/src/store/useAppStore.ts` — Zustand store with localStorage persistence
- `artifacts/arc-academy/src/pages/` — LandingPage, DashboardPage, QuizPage
- `artifacts/arc-academy/src/components/` — Navbar, CheckInModal, WalletModal

## Architecture decisions

- State is stored in Zustand with `persist` middleware (localStorage) — designed to be swapped to Supabase by replacing the store's side effects with API calls
- No Next.js — built as React + Vite SPA (functionally identical for this use case, supports SSR migration later)
- Wallet connection uses raw `window.ethereum` with a Demo Mode fallback — ready for wagmi/viem upgrade
- Quiz unlock requires doc link click before "Take Quiz" is enabled — tracked per quiz ID in visitedDocs
- NFT minting is simulated with a fake tx hash — ready for real Arc testnet contract integration

## Product

- 5 quiz modules covering Arc House, USDC on Arc, ERC-8183 Agentic Flow, Q-Day readiness, and Circle AI Skills
- Each quiz: 5 questions, 4/5 to pass, +10 points on pass
- Daily 7-day streak: Day N = N points, resets on miss or after Day 7
- NFT certificate minting unlocks per-quiz after passing

## User preferences

- React + Vite (not Next.js) for this Replit environment
- Supabase to be added later — architecture supports it
- Keep logic simple and maintainable, beginner-friendly

## Gotchas

- Orbitron + Inter fonts loaded via Google Fonts in index.html
- `window.ethereum` is typed via a global declaration — may need `@types/window-ethereum` for stricter TS
- Quiz score tracking: the score state is incremented on answer selection, not in `handleNext`
