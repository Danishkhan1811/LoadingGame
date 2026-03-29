# loading-games — Implementation Plan

> Generated: 2026-03-24
> Covers all remaining work needed to reach v1.0 as defined in SPEC.md

---

## Overview

Work is organized into **8 phases**, ordered by dependency. Each phase lists concrete tasks, files to create/move, and acceptance criteria. Estimated effort is in developer-hours (solo).

---

## Phase 1: Monorepo Scaffold (~4 hours) ✅ COMPLETE

**Goal:** `pnpm install && pnpm build` succeeds with the existing code in proper locations.

~~This is the **highest priority** — nothing else works until this is done.~~

### Tasks

#### 1.1 Create directory structure
```
loading-games/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── index.ts              ← NEW: entry point that exports & registers web component
│   │   │   ├── component.ts          ← MOVE from root
│   │   │   ├── controller.ts         ← MOVE from root
│   │   │   ├── theme.ts              ← MOVE from root
│   │   │   ├── delay.ts              ← MOVE from root
│   │   │   ├── scores.ts             ← MOVE from root
│   │   │   ├── types.ts              ← MOVE from root
│   │   │   └── games/
│   │   │       ├── snake/index.ts     ← MOVE from root index.ts (rename)
│   │   │       ├── flappy/index.ts    ← MOVE from mnt/.../flappy/
│   │   │       ├── memory-cards/index.ts  ← MOVE from mnt/.../memory-cards/
│   │   │       ├── whack-a-mole/index.ts  ← MOVE from mnt/.../whack-a-mole/
│   │   │       ├── brick-breaker/index.ts ← STUB (Phase 3)
│   │   │       ├── 2048/index.ts          ← STUB (Phase 3)
│   │   │       ├── asteroids/index.ts     ← STUB (Phase 3)
│   │   │       └── wordle-lite/index.ts   ← STUB (Phase 3)
│   │   ├── tests/
│   │   │   └── core.test.ts          ← MOVE from root
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── react/
│   │   ├── src/
│   │   │   ├── index.ts              ← re-export LoadingGame
│   │   │   ├── LoadingGame.tsx        ← MOVE from root
│   │   │   └── types.ts              ← re-export from core
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── vue/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── LoadingGame.vue        ← NEW (Phase 4)
│   │   │   └── composable.ts          ← NEW (Phase 4)
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── svelte/
│       ├── src/
│       │   ├── index.ts
│       │   └── LoadingGame.svelte     ← NEW (Phase 4)
│       ├── package.json
│       └── tsconfig.json
├── cli/
│   ├── src/
│   │   ├── index.ts                   ← MOVE from mnt/.../cli/
│   │   └── templates/                 ← NEW
│   └── package.json
├── apps/
│   └── demo/                          ← Phase 7
├── docs/                              ← Phase 8
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                     ← MOVE from root
│   │   └── release.yml                ← NEW
│   └── PULL_REQUEST_TEMPLATE.md       ← NEW
├── pnpm-workspace.yaml                ← NEW
├── package.json                       ← NEW (root)
├── tsconfig.base.json                 ← NEW
├── turbo.json                         ← NEW
├── .size-limit.json                   ← MOVE from root (update paths)
├── tsup.config.ts                     ← MOVE into packages/core/ (update paths)
├── .eslintrc.cjs                      ← NEW
├── .prettierrc                        ← NEW
├── changeset.config.json              ← NEW (or .changeset/config.json)
├── LICENSE                            ← NEW
├── README.md                          ← KEEP at root
├── CONTRIBUTING.md                    ← KEEP at root
└── SPEC.md                            ← KEEP at root
```

#### 1.2 Create root `package.json`
- `"private": true`
- Scripts: `build`, `dev`, `test`, `lint`, `typecheck`, `format`, `size-limit`, `changeset`, `release`
- DevDependencies: `typescript`, `tsup`, `vitest`, `eslint`, `prettier`, `@changesets/cli`, `size-limit`, `turbo`

#### 1.3 Create `pnpm-workspace.yaml`
```yaml
packages:
  - "packages/*"
  - "cli"
  - "apps/*"
```

#### 1.4 Create `turbo.json`
- Pipeline: `build` (depends on `^build`), `test`, `lint`, `typecheck`, `dev`
- Cache outputs: `dist/**`

#### 1.5 Create `tsconfig.base.json`
- `strict: true`, `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`
- `declaration: true`, `declarationMap: true`, `sourceMap: true`

#### 1.6 Create per-package `package.json` files
- `packages/core/package.json`: name `loading-games`, exports map with sub-path exports (`./react`, `./vue`, `./svelte` OR separate packages)
- `packages/react/package.json`: name `loading-games-react` (or sub-path)
- `packages/vue/package.json`: name `loading-games-vue`
- `packages/svelte/package.json`: name `loading-games-svelte`
- `cli/package.json`: name `loading-games-cli`, `bin` field pointing to built CLI

#### 1.7 Create `packages/core/src/index.ts` (entry point)
```typescript
export { LoadingGameElement } from './component.js'
export * from './types.js'
export { resolveTheme } from './theme.js'
export { getPersonalBest, saveScore, clearScores } from './scores.js'

// Auto-register custom element
if (typeof customElements !== 'undefined' && !customElements.get('loading-game')) {
  customElements.define('loading-game', LoadingGameElement)
}
```

#### 1.8 Fix all import paths
- All `../../types.js` → adjust to match new directory depth
- `core.test.ts` import paths → `../src/scores.js`, `../src/delay.js`, `../src/theme.js`
- `LoadingGame.tsx` imports → `loading-games` (or relative to core)

#### 1.9 Create ESLint + Prettier configs
- ESLint: TypeScript plugin, no-any rule, import order
- Prettier: single quotes, semi, trailing commas

#### 1.10 Create stub game files for unimplemented games
Each stub exports a class implementing `GamePlugin` that renders a "Coming soon" message on the canvas. This allows the build to succeed.

#### 1.11 Create `LICENSE` file (MIT)

### Acceptance Criteria
- [x] `pnpm install` completes
- [x] `pnpm build` compiles all packages without errors
- [x] `pnpm typecheck` passes (with `noUnusedLocals: false` for stubs)
- [x] `pnpm test` runs 16 tests and they pass
- [x] Bundle sizes verified: Core ~33kB, Games 1.7–5.8kB, React 1kB, Vue 1.3kB, Svelte 54B

**Bugs fixed during scaffold:**
- `DelayController`: `delayTimer` not nulled after firing → `end()` short-circuited instead of processing minDisplay
- `theme.ts`: `window.matchMedia` throws in jsdom → wrapped in try/catch

---

## Phase 2: Fix & Polish Existing Games (~3 hours) ✅ COMPLETE

**Goal:** The 4 existing games meet every spec requirement and pass the game checklist from CONTRIBUTING.md.

### Tasks

#### 2.1 Snake — Minor fixes
- [x] Add game-specific `aria-label`: `"Snake game — loading in background"`
- [x] Render virtual D-pad overlay on touch devices (detect via `'ontouchstart' in window`)
  - D-pad: 4 directional buttons, 44×44px minimum, semi-transparent, positioned bottom-center
  - D-pad only appears on touch-capable devices
- [x] Ensure min 44×44px touch targets for swipe detection threshold (30px swipe threshold)
- [x] Verify bundle size < 10 kB gzipped after build (6.79 kB)

#### 2.2 Flappy Bird — Minor fixes
- [x] Add game-specific `aria-label`
- [x] Verify no hardcoded colors outside theme (bird color `#FFD93D` is intentional — acceptable as game art)
- [x] Verify bundle size (4.38 kB)

#### 2.3 Memory Cards — Fixes
- [x] Add game-specific `aria-label`
- [x] Add keyboard support: Tab/Shift+Tab/arrows to navigate, Enter/Space to flip
- [x] Add speed bonus: `timeBonus = Math.max(0, 60 - secondsElapsed) * 5` on game completion
- [x] Improve matched-card glow: pulsing `theme.primary` border (3px) + shadowBlur glow
- [x] Verify bundle size (6.13 kB)

#### 2.4 Whack-a-Mole — Fixes
- [x] Add game-specific `aria-label`
- [x] Replace `setInterval` mole spawner with RAF-based timer (`nextSpawnTime` checked in update loop)
  - Spawn rate accelerates: 900ms → 500ms over the 20-second round
  - Mole hide timers also replaced with `hideAt` timestamps (no more setTimeout)
- [x] Add keyboard support: number keys 1-9 to whack corresponding hole (with visual number hints)
- [x] Verify bundle size (6.40 kB)

### Acceptance Criteria
- [x] All 4 games pass the CONTRIBUTING.md checklist (5 methods, RAF only, theme colors, destroy cleanup, DPR scaling, touch, keyboard, <10kB)
- [x] Each game has a game-specific `aria-label`
- [x] All 16 unit tests still pass
- [x] Build succeeds with no errors

---

## Phase 3: Implement Remaining 4 Games (~16 hours) — DEFERRED (post-library-ready)

> **Note:** This phase will be implemented **after** the library infrastructure is fully ready (Phases 1–2, 4–8 complete). The 4 stub games allow the library to build, ship, and be used immediately with the 4 existing games. Full game implementations will follow as content updates.

**Goal:** All 8 games playable, each under 10 kB gzipped.

### 3.1 2048 Game (~3 hours)

**File:** `packages/core/src/games/2048/index.ts`

**Implementation plan:**
1. **Data model**: 4×4 `number[][]` grid, `0` = empty
2. **Core logic**: `moveLeft()`, `moveRight()`, `moveUp()`, `moveDown()` — each slides tiles + merges adjacent equals
3. **Tile spawning**: After each move, spawn a `2` (90%) or `4` (10%) in a random empty cell
4. **Scoring**: On merge, add merged tile value to score
5. **Animation**: Track `mergedTiles` array, on render scale merged tiles briefly (1.1x for 150ms)
6. **Controls**: Arrow keys (only when canvas is focused — check `document.activeElement === canvas`), swipe gestures on touch
7. **localStorage state**: Save grid + score on every move, restore on `init()`. Key: `lg-2048-state` (or namespaced)
8. **Game over detection**: No valid moves remain
9. **Win detection**: 2048 tile reached → show overlay, allow "continue playing"
10. **Rendering**: Rounded-rect tiles, colors based on value (2=light, 4=slightly darker, etc.), slide animation between positions

**Key spec requirements:**
- Does NOT capture arrow keys when canvas is not focused
- State persists across sessions (even after loading completes)

### 3.2 Brick Breaker (~4 hours)

**File:** `packages/core/src/games/brick-breaker/index.ts`

**Implementation plan:**
1. **Bricks**: 6 rows × 10 columns. Each brick has `{ alive, color, points }`. Points: bottom row=10, top row=60
2. **Ball**: Circle with `vx`, `vy` velocity. Start at paddle, launch on click/tap
3. **Paddle**: Rectangle at bottom, follows mouse X / touch X. Clamp to canvas bounds
4. **Physics**: Ball bounces off walls (top, left, right), paddle, and bricks. Simple AABB collision detection
5. **Lives**: 3 balls per round. Ball falls below paddle → lose a life. 0 lives → game over → auto-restart
6. **Power-ups**: On brick destroy, 20% chance to drop a power-up. Types:
   - **Wide paddle**: Doubles paddle width for 10 seconds
   - **Multi-ball**: Spawns 2 extra balls from current position
   - **Slow ball**: Halves ball speed for 8 seconds
   Power-ups are small colored rectangles that fall straight down. Catch with paddle to activate
7. **Rendering**: Bricks as rounded rects with theme colors (varying brightness per row), paddle in `theme.primary`, ball in `theme.text`
8. **Controls**: `mousemove` + `touchmove` → paddle X position

### 3.3 Asteroids (~5 hours)

**File:** `packages/core/src/games/asteroids/index.ts`

**Implementation plan:**
1. **Ship**: Triangle at center. State: `{ x, y, angle, vx, vy }`. Wraps around screen edges
2. **Controls**: Left/Right arrow = rotate (5°/frame), Up = thrust (acceleration in facing direction), Space = shoot bullet
3. **Bullets**: Array of `{ x, y, vx, vy, life }`. Travel in the direction ship was facing. Despawn after ~60 frames
4. **Asteroids**: Array of `{ x, y, vx, vy, size, vertices }`. Sizes: large (3 hits = 20pts), medium (2 fragments = 50pts), small (destroyed = 100pts)
   - Random irregular polygon vertices for visual variety (pre-generated on spawn)
   - On hit: large splits into 2 medium, medium splits into 2 small, small destroyed
5. **Collision**: Circle-based (asteroid radius vs bullet point, asteroid radius vs ship center)
6. **Particles**: On asteroid destruction and ship death — array of small dots with velocity and fade-out
7. **Levels**: Start with 4 large asteroids. When all destroyed, spawn `level + 3` new large asteroids
8. **Death**: Ship explodes (particles), respawn after 2 seconds with brief invincibility (blinking)
9. **Rendering**: Vector-style — all shapes drawn with `ctx.stroke()` using `theme.primary` for ship, `theme.text` for asteroids, `theme.accent` for bullets/particles
10. **Virtual D-pad**: Same as Snake — render directional + fire buttons on touch devices

### 3.4 Wordle-lite (~4 hours)

**File:** `packages/core/src/games/wordle-lite/index.ts`

**Implementation plan:**
1. **Word list**: Embed ~2500 common 5-letter words as a compressed string (e.g., joined by delimiter, no JSON overhead). ~12.5 kB raw → ~4-5 kB gzipped
2. **Daily word**: Seed by date: `words[daysSinceEpoch % words.length]`
3. **Grid**: 6 rows × 5 columns. State: `guesses: string[]`, `currentGuess: string`
4. **Input**:
   - Keyboard: Listen for `keydown` A-Z (add letter), Backspace (remove), Enter (submit)
   - Virtual keyboard: Render 3-row QWERTY keyboard on canvas, detect click/tap on each key
   - Virtual keyboard colors update after each guess (green/yellow/gray per letter)
5. **Validation**: On Enter, check if `currentGuess` is in word list. If not, shake animation on current row
6. **Color feedback** (per letter in submitted guess):
   - Green (`theme.primary` or dedicated green): letter is in correct position
   - Yellow (`theme.accent` or dedicated yellow): letter exists but wrong position
   - Gray (`theme.surface`): letter not in word
   - Algorithm: Standard Wordle — first pass marks greens, second pass marks yellows (respecting letter frequency)
7. **State persistence**: Save `{ date, guesses, solved }` to localStorage. On `init()`, restore if same date
8. **Win/Loss**: 
   - Win: Show "🎉" overlay, all tiles flip green
   - Loss (6 guesses used): Show answer, "Try again tomorrow"
9. **Rendering**: Grid cells as rounded rects, flip animation on reveal (similar to memory cards), virtual keyboard at bottom

**Bundle concern:** The word list is the biggest payload. Strategies:
- Use a minimal common-word list (2000 words = ~10 kB raw, ~3.5 kB gzipped)
- Or use a simple encoding: delta-encode sorted words (saves ~30%)

### Acceptance Criteria
- [ ] All 8 games render and are playable
- [ ] Each game < 10 kB gzipped
- [ ] Each game has keyboard + touch controls
- [ ] Each game applies theme colors
- [ ] Each game implements all 5 `GamePlugin` methods correctly
- [ ] `pnpm build && pnpm size-limit` passes

---

## Phase 4: Framework Wrappers (~3 hours) ✅ COMPLETE

**Goal:** Vue 3 and Svelte wrappers work in real projects.

### 4.1 Vue 3 Wrapper ✅

**File:** `packages/core/src/vue/index.ts` + `packages/core/src/vue/composable.ts`

```vue
<template>
  <loading-game ref="el" v-bind="attrs" />
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import 'loading-games' // registers web component

const props = defineProps<{
  game?: string; active?: boolean; theme?: object
  size?: string; delay?: number; minDisplay?: number
  exitAnimation?: string; saveScores?: boolean; namespace?: string
}>()

const emit = defineEmits(['score', 'gameover', 'complete', 'error'])

const el = ref<HTMLElement | null>(null)
// Sync theme as property, attach event listeners, forward attrs as attributes
</script>
```

**File:** `packages/vue/src/composable.ts`
- `useLoadingGame()` composable for programmatic control

### 4.2 Svelte Wrapper ✅

**File:** `packages/core/src/svelte/index.ts`

```svelte
<script>
  import 'loading-games'
  export let game = 'random'
  export let active = false
  export let theme = undefined
  // ... other props
  // Use bind:this, dispatch events
</script>
<loading-game {game} active={active ? 'true' : undefined} bind:this={el} />
```

### 4.3 Fix React Wrapper imports ✅
- [x] Update import paths to reference `loading-games` core package properly
- [x] Ensure `types.ts` re-exports work
- [x] Added type re-exports (GameName, GameSize, ExitAnimation, ThemeObject, etc.) to react/index.ts

### 4.4 Example apps (optional but valuable)
- `apps/examples/react/` — minimal Next.js app with `<LoadingGame>` on a button click
- `apps/examples/vue/` — minimal Vite + Vue app
- `apps/examples/svelte/` — minimal SvelteKit app

### Acceptance Criteria
- [x] Vue wrapper renders and responds to `:active` prop changes
- [x] Vue `useLoadingGame()` composable provides programmatic control (start/stop/setTheme/isActive)
- [x] Svelte wrapper provides `loadingGame` action + `createLoadingGame` factory
- [x] Svelte wrapper renders and responds to `active` prop changes
- [x] React wrapper still works after import path changes
- [x] TypeScript types resolve correctly in all three frameworks
- [x] All 16 unit tests pass, typecheck clean
- [x] Bundle sizes: React 1.04 KB, Vue 2.62 KB, Svelte 1.58 KB

**Additional fixes:**
- `turbo.json`: Renamed `pipeline` to `tasks` for Turborepo v2 compatibility

---

## Phase 5: UX Polish & Accessibility (~3 hours) ✅ COMPLETE

**Goal:** All UX flows from SPEC.md §17 work end-to-end. Accessibility requirements from §16 are met.

### Tasks

#### 5.1 Controller fixes ✅
- [x] Set game-specific `aria-label` on canvas: `"${gameName} game — loading in background"` (already implemented)
- [x] Fire `onGameOver` callback when a game round ends
  - Used Option A: added `onGameOver?: () => void` as second constructor param
  - Wired into Snake (self-collision), Flappy (die), Memory Cards (all matched), Whack-a-Mole (round timer)
  - Controller dispatches `GameResult` with `{ game, finalScore, duration, isNewRecord }`
- [x] Error path: added `errorDeactivate()` method — immediate teardown with no animation. Component's `onError` callback calls it before dispatching the event.

#### 5.2 Virtual D-pad component ✅
- [x] Created `packages/core/src/dpad.ts` — reusable `Dpad` class
  - 44×44px buttons, 3×3 grid, optional center fire button
  - Semi-transparent, themed with primaryColor/textColor
  - Only mounts when `'ontouchstart' in window`
  - Exported from main index as `Dpad`, `DpadDirection`, `DpadOptions`
- [x] Integrated into Snake game (replaced 60+ lines of inline D-pad with `Dpad` import)
- [x] Asteroids is a stub (Phase 3) — D-pad integration prepped via constructor param

#### 5.3 Integration tests ✅
- [x] Playwright E2E test: mount `<loading-game game="snake" active="true">`, verify canvas renders with aria-label
- [x] Playwright test: set active false, verify game exits and canvas is removed
- [x] Playwright test: fast load (deactivate before delay), verify game never appears

### Acceptance Criteria
- [x] Skip link is keyboard-navigable (implemented in controller setupDOM)
- [x] Virtual D-pad appears on touch devices for Snake (Asteroids deferred to Phase 3)
- [x] `aria-label` is game-specific
- [x] `onGameOver` fires correctly for Snake, Flappy, Memory Cards, Whack-a-Mole
- [x] 3 Playwright E2E tests pass, 16 unit tests pass

---

## Phase 6: CLI Tool Polish (~2 hours) ✅ COMPLETE

**Goal:** `npx loading-games init` works in fresh React, Vue, and Svelte projects.

### Tasks

#### 6.1 CLI package setup ✅
- [x] Create `cli/package.json` with `"bin": { "loading-games": "./dist/index.js" }`
- [x] Add shebang `#!/usr/bin/env node` to entry (already present)
- [x] Add tsup build config for CLI (compile to ESM for Node)

#### 6.2 Create templates directory ✅
- [x] `cli/src/templates/react.ts` — full React component snippet with hooks
- [x] `cli/src/templates/vue.ts` — Vue 3 `<script setup>` SFC snippet
- [x] `cli/src/templates/svelte.ts` — Svelte snippet with action and web component options
- [x] `cli/src/templates/vanilla.ts` — Vanilla JS snippet with imperative API
- [x] Refactored `index.ts` to import snippets from templates

#### 6.3 Improve detection ✅
- [x] Config file detection: `next.config.*`, `nuxt.config.*`, `svelte.config.*`, `vite.config.*`, `angular.json`
- [x] Package.json dep detection also checks for `nuxt` and `next` directly
- [x] Print detected config file for clarity
- [x] `--dry-run` flag skips install, shows what would run

#### 6.4 Test manually ✅
- [x] Tested `--dry-run` in monorepo root (detected: vanilla, pnpm) — correct
- [x] CLI builds to 6.36 KB single ESM bundle
- [x] Typecheck clean across both packages

### Acceptance Criteria
- [x] `npx loading-games init` detects framework correctly via deps + config files
- [x] Prints correct snippet for each framework
- [x] `--dry-run` mode works without side effects
- [x] Works with pnpm, yarn, and npm detection

---

## Phase 7: Demo Site (~8 hours) ✅ COMPLETE

**Goal:** A polished Astro site at `apps/demo/` showcasing all games.

### Tasks

#### 7.1 Scaffold Astro project ✅
- [x] Created `apps/demo/` with Astro 4, `@astrojs/react`, `@astrojs/tailwind`
- [x] Configured workspace dependency on `loading-games`
- [x] TailwindCSS with custom brand color palette
- [x] Vite SSR config to externalize `vue`/`svelte` peer deps

#### 7.2 Homepage (`/`) ✅
- [x] Hero section with tagline, live Snake preview (`GamePreview` React island)
- [x] `CodeTabs` component with React / Vue / Svelte / Vanilla tabs
- [x] Install CTA with copy-to-clipboard `npm install loading-games`
- [x] Feature grid: zero-dependency, <10kB, 8 games, framework-agnostic
- [x] Games preview grid with emoji icons linking to `/games`
- [x] Footer with GitHub + npm links

#### 7.3 Games page (`/games`) ✅
- [x] 4×2 grid of game cards with live `GamePreview` inside each card
- [x] Each card: emoji, name, bundle size badge, control description
- [x] Games auto-play using `client:visible` directive for lazy hydration

#### 7.4 Configurator page (`/configurator`) ✅
- [x] `ThemeConfigurator` React island: game selector, size selector, 5 color pickers
- [x] Live game preview (left panel) with real-time theme updates
- [x] Generated code snippet (right panel) with copy-to-clipboard button

#### 7.5 Docs page (`/docs`) ✅
- [x] Sections: Installation, Quick Start, Configuration, Theming, Games, Events, Accessibility, CLI
- [x] Sticky sidebar navigation
- [x] Full props table + events table

#### 7.6 Mobile responsiveness ✅
- [x] All pages use responsive Tailwind grid (sm/lg breakpoints)
- [x] Sticky nav, responsive game cards

#### 7.7 SEO & sharing ✅
- [x] Meta tags (og:title, og:description, twitter:card) on all pages via Layout
- [x] `robots.txt`, `favicon.svg`

### Acceptance Criteria
- [x] `pnpm --filter loading-games-demo build` succeeds (4 pages)
- [x] All 4 pages render correctly
- [x] All 8 games shown on `/games` with live previews
- [x] Configurator generates correct code with copy button
- [x] Responsive layout down to mobile widths

---

## Phase 8: Launch Prep (~3 hours) ✅ COMPLETE

**Goal:** Ready for npm publish, Product Hunt, and GitHub launch.

### Tasks

#### 8.1 CI/CD finalization ✅
- [x] Added Playwright install + E2E test step to `ci.yml`
- [x] Create `release.yml` workflow: changeset detection → version bump → npm publish → GitHub release
- [x] Create `.github/PULL_REQUEST_TEMPLATE.md`

#### 8.2 npm publish prep ✅
- [x] `exports` field with ESM/CJS/types for `.`, `./react`, `./vue`, `./svelte`
- [x] `"sideEffects"` configured
- [x] `"files": ["dist"]`
- [x] `npm publish --dry-run` succeeds — 38 files, 138.3 kB package

#### 8.3 Documentation polish ✅
- [x] README updated with accurate API, game status (4 complete + 4 stubs), framework examples
- [x] Full docs page on demo site: Installation, Quick Start, Config, Theming, Games, Events, Accessibility, CLI

#### 8.4 Launch assets — Manual steps remaining
- [ ] Record 30-second demo video (manual)
- [ ] Draft Product Hunt listing (manual)
- [ ] Draft Show HN post (manual)
- [ ] Set GitHub repo description + topics (manual)

### Acceptance Criteria
- [x] `npm publish --dry-run` succeeds
- [x] CI pipeline config includes typecheck, lint, test, build, size-limit, Playwright
- [x] README has all required sections
- [ ] Demo video recorded (manual step)

---

## Effort Summary

| Phase | Description | Est. Hours |
|-------|-------------|-----------|
| 1 | Monorepo Scaffold | 4 |
| 2 | Fix Existing Games | 3 |
| 3 | Implement 4 Remaining Games | 16 |
| 4 | Framework Wrappers (Vue, Svelte) | 3 |
| 5 | UX Polish & Accessibility | 3 |
| 6 | CLI Polish | 2 |
| 7 | Demo Site | 8 |
| 8 | Launch Prep | 3 |
| **Total** | | **~42 hours** |

---

## Recommended Execution Order

```
Phase 1 (Monorepo) ✅ ──→ Phase 2 (Fix Games) ──→ Phase 4 (Wrappers) ──→ Phase 5 (UX/A11y)
                                                        ↓
                                                  Phase 6 (CLI) ──→ Phase 7 (Demo) ──→ Phase 8 (Launch)
                                                                                              ↓
                                                                                    Phase 3 (New Games) — post-launch content updates
```

Phase 3 (remaining 4 games) is deferred to after library launch. The 4 existing games are sufficient for v1.0. Phase 5 should follow Phase 2 since it touches game code. Phase 7 requires wrappers to be complete.

---

## Risk Areas

| Risk | Mitigation |
|------|-----------|
| **Wordle word list too large** | Use 2000-word list instead of 2500; delta-encode or use simple join |
| **Asteroids complexity** | Start with minimal version (no particles), add polish after core works |
| **Bundle size overruns** | Run `pnpm size-limit` after each game. Refactor aggressively if close to 10kB |
| **Vue/Svelte wrapper edge cases** | Web Components have known quirks in Vue (use `defineCustomElement` workaround) and Svelte. Test thoroughly |
| **Import path breakage during restructure** | Do Phase 1 carefully; run `pnpm typecheck` after every file move |
| **Canvas DPR issues across devices** | Test on 1x, 2x, and 3x DPR screens. Use consistent DPR setup pattern from Snake game |
