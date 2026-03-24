# Development Milestones & Task Breakdown

This file tracks the development roadmap for `loading-games` v1.0.
Use it as a checklist in Windsurf to plan and track work.

---

## Milestone 0 — Monorepo Scaffolding
**Goal:** `pnpm build` succeeds, all packages have skeleton structure.

- [ ] Initialize git repo
- [ ] Create `pnpm-workspace.yaml` ✅
- [ ] Set up Turborepo (`turbo.json`) ✅
- [ ] Create `packages/core` with `package.json`, `tsconfig.json`, `tsup.config.ts` ✅
- [ ] Create `packages/core/src/types.ts` ✅
- [ ] Shared `tsconfig.base.json` ✅
- [ ] ESLint + Prettier config ✅
- [ ] Create CLI package skeleton ✅
- [ ] Create `apps/demo` skeleton ✅
- [ ] Verify: `pnpm install && pnpm build` completes without errors

---

## Milestone 1 — Core Package
**Goal:** Web Component registers, `<loading-game game="snake" active="true">` renders.

- [ ] `types.ts` — all interfaces ✅
- [ ] `theme.ts` — 3-level resolution ✅
- [ ] `scores.ts` — localStorage persistence ✅
- [ ] `delay.ts` — DelayController ✅
- [ ] `component.ts` — Web Component ✅
- [ ] `controller.ts` — GameController ✅
- [ ] `index.ts` — entry point ✅
- [ ] All 8 game stub files ✅
- [ ] Unit tests passing (`pnpm test`) ✅
- [ ] Verify: Web Component renders in a plain HTML test page

---

## Milestone 2 — Games (implement one at a time)
**Goal:** All 8 games are playable, each passes bundle size check.

### Snake (baseline game — do first)
- [x] Full implementation in `games/snake/index.ts`
- [ ] Keyboard controls (arrow keys)
- [ ] Swipe controls (touch)
- [ ] Virtual D-pad renders on mobile
- [ ] Theme colors applied
- [ ] Score emitted on food eaten
- [ ] `destroy()` cleans up all RAF + listeners
- [ ] Bundle: < 10 kB gzipped

### Flappy Bird
- [x] Full implementation ✅ (in `games/flappy/index.ts`)
- [ ] Physics loop (gravity + jump impulse)
- [ ] Spacebar + click + tap controls
- [ ] Pipe color matches theme.primary
- [ ] Personal best shown in corner
- [ ] Bundle: < 10 kB gzipped

### Memory Cards
- [x] Full implementation ✅
- [ ] 4×4 grid, emoji pairs
- [ ] Flip animation (3D via canvas transform)
- [ ] Match glow (theme.primary border)
- [ ] Win detection + auto-reset
- [ ] Bundle: < 10 kB gzipped

### Whack-a-Mole
- [x] Full implementation ✅
- [ ] 3×3 grid, 20-second rounds
- [ ] Mole pop-up animation
- [ ] Hit detection (click + touch)
- [ ] Timer bar
- [ ] Bundle: < 10 kB gzipped

### 2048 (implement next)
- [ ] 4×4 grid, tile merge logic
- [ ] Arrow key + swipe input
- [ ] Tile merge animation
- [ ] State saves to localStorage
- [ ] Doesn't capture arrow keys when not focused
- [ ] Bundle: < 10 kB gzipped

### Brick Breaker
- [ ] 6×10 brick grid
- [ ] Ball physics + paddle
- [ ] Power-up drop system (20% rate)
- [ ] Mouse + touch drag paddle
- [ ] Bundle: < 10 kB gzipped

### Asteroids
- [ ] Vector-style rocks
- [ ] Ship rotation + thrust + shoot
- [ ] Rock splitting (large → medium → small)
- [ ] Particle effects on explosion
- [ ] Bundle: < 10 kB gzipped

### Wordle-lite
- [ ] 6×5 guess grid
- [ ] Color feedback (green/yellow/gray)
- [ ] Virtual keyboard for mobile
- [ ] Date-seeded word (same word all day)
- [ ] Compressed word list (~2500 words)
- [ ] Bundle: < 10 kB gzipped (including word list)

---

## Milestone 3 — Framework Wrappers
**Goal:** Each wrapper works in a real app.

- [x] React wrapper (`src/react/`) ✅
- [x] Vue 3 wrapper (`src/vue/`) ✅
- [x] Svelte wrapper (`src/svelte/`) ✅
- [ ] Example apps in `apps/examples/react/`, `apps/examples/vue/`, `apps/examples/svelte/`
- [ ] Test all wrappers manually in dev mode
- [ ] TypeScript types check in all framework contexts

---

## Milestone 4 — Delay & UX Polish
**Goal:** All UX flows from SPEC.md §8 work correctly.

- [ ] Happy path: game shows after 800ms delay
- [ ] Fast load path: game never shows if load < 800ms
- [ ] Completion overlay: "Done!" fades in, game exits after 1.5s
- [ ] minDisplay: game stays visible for minimum duration
- [ ] Exit animations: fade, slide, none all work
- [ ] Tab blur: game pauses on `visibilitychange`
- [ ] Tab focus: game resumes on `visibilitychange`
- [ ] Error path: `onError` exits game immediately
- [ ] prefers-reduced-motion: static fallback renders

---

## Milestone 5 — CLI Tool
**Goal:** `npx loading-games init` works in a fresh React/Vue/Svelte project.

- [x] CLI entry point (`cli/src/index.ts`) ✅
- [ ] Framework detection logic
- [ ] Auto-install via detected package manager
- [ ] Test in a fresh `create-next-app` project
- [ ] Test in a fresh `create-vue` project
- [ ] Test in a fresh `create-svelte` project

---

## Milestone 6 — Bundle Size CI
**Goal:** CI fails if any chunk exceeds its limit.

- [x] `.size-limit.json` configured ✅
- [x] `ci.yml` runs size-limit step ✅
- [ ] All 8 games passing size check
- [ ] Core entry < 8 kB verified
- [ ] React/Vue/Svelte wrappers < 4 kB verified

---

## Milestone 7 — Demo Site
**Goal:** `loading.games` is live and converts browsers to users.

- [x] Homepage (`apps/demo/src/pages/index.astro`) ✅
- [ ] `/games` page — all 8 games playable
- [ ] `/configurator` page — live theme + game preview with code output
- [ ] `/docs` — full API reference (MDX)
- [ ] Mobile responsive
- [ ] OG image for sharing (shows game in action)
- [ ] Deploy to Vercel / Netlify

---

## Milestone 8 — Launch Prep
**Goal:** Ready for Product Hunt and GitHub launch.

- [ ] README polished with animated GIFs per game
- [ ] `CONTRIBUTING.md` ✅
- [ ] MIT `LICENSE` file
- [ ] GitHub repo description + topics set
- [ ] npm publish dry-run succeeds
- [ ] Product Hunt listing drafted
- [ ] Demo video recorded (30s showing library in a real SaaS app)
- [ ] Show HN post drafted

---

## Backlog (v1.1+)

- [ ] Custom game plugin API (`GamePlugin` interface already defined ✅)
- [ ] Shared leaderboard (Supabase Realtime)
- [ ] Angular wrapper
- [ ] Analytics hook (vendor-agnostic)
- [ ] WCAG AA certification audit
- [ ] Sound effects (opt-in, lazy-loaded)
- [ ] React Native / Expo support (v2.0)
- [ ] Multiplayer scores via WebSocket (v2.0)
