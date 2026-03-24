# loading-games — Project Specification
## Complete Technical Reference for AI-Assisted Development

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Package name** | `loading-games` |
| **Type** | Open-source npm library |
| **License** | MIT |
| **Status** | Pre-build / Proposal |
| **Target launch** | Week 6 (v1.0) |

---

## 2. Core Concept

A lightweight, zero-dependency JavaScript library that replaces loading spinners with playable mini-games. The `active` boolean prop starts/stops the game. When loading completes, the game pauses and exits with an animation. The entire experience takes one component and one prop to integrate.

**The Namco patent (1995) popularized this idea for gaming consoles. This library brings it to the web for the first time as a polished, developer-ergonomic open-source package.**

---

## 3. Repository Structure

```
loading-games/
├── packages/
│   ├── core/                    # Framework-agnostic core (Web Component + vanilla JS)
│   │   ├── src/
│   │   │   ├── index.ts         # Main entry point, exports LoadingGameElement
│   │   │   ├── component.ts     # Web Component definition (<loading-game>)
│   │   │   ├── controller.ts    # Game lifecycle management
│   │   │   ├── theme.ts         # Theme resolution logic
│   │   │   ├── delay.ts         # Intelligent delay system
│   │   │   ├── scores.ts        # localStorage score persistence
│   │   │   ├── types.ts         # All shared TypeScript types
│   │   │   └── games/
│   │   │       ├── snake/
│   │   │       │   ├── index.ts
│   │   │       │   └── snake.ts
│   │   │       ├── brick-breaker/
│   │   │       ├── flappy/
│   │   │       ├── 2048/
│   │   │       ├── wordle-lite/
│   │   │       ├── asteroids/
│   │   │       ├── memory-cards/
│   │   │       └── whack-a-mole/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── react/                   # React wrapper
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── LoadingGame.tsx
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   ├── vue/                     # Vue 3 wrapper
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── LoadingGame.vue
│   │   │   └── composable.ts
│   │   └── package.json
│   │
│   └── svelte/                  # Svelte wrapper
│       ├── src/
│       │   ├── index.ts
│       │   └── LoadingGame.svelte
│       └── package.json
│
├── apps/
│   └── demo/                    # Demo site (Next.js or Astro)
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   └── styles/
│       └── package.json
│
├── cli/                         # npx loading-games init
│   ├── src/
│   │   ├── index.ts
│   │   ├── detect-framework.ts
│   │   └── templates/
│   └── package.json
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── bundle-size.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/
│   ├── games/                   # Per-game documentation
│   ├── api/                     # Full API reference
│   └── contributing/            # Game contribution guide
│
├── pnpm-workspace.yaml
├── package.json                 # Root (monorepo)
├── tsconfig.base.json
├── turbo.json
└── changeset.config.json
```

---

## 4. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Monorepo** | pnpm workspaces + Turborepo | Fast, cache-aware, well-adopted |
| **Build** | tsup (ESBuild-based) | Fast, dual CJS+ESM output, code splitting |
| **Language** | TypeScript 5.x strict | Types shipped in-box |
| **Games** | HTML Canvas (2D context) | Consistent, performant, no DOM thrashing |
| **Bundler** | tsup per package | Separate chunks per game via dynamic import |
| **Testing** | Vitest + Playwright | Unit for logic, E2E for rendering |
| **Linting** | ESLint + Prettier | Standard setup |
| **Release** | Changesets + GitHub Actions | Automated versioning and npm publish |
| **Demo site** | Astro + React islands | Fast static site with interactive playgrounds |

---

## 5. TypeScript Types (Complete Reference)

```typescript
// packages/core/src/types.ts

export type GameName =
  | 'snake'
  | 'brick-breaker'
  | 'flappy'
  | '2048'
  | 'wordle-lite'
  | 'asteroids'
  | 'memory-cards'
  | 'whack-a-mole'
  | 'random'

export type GameSize = 'sm' | 'md' | 'lg' | 'full'

export type ExitAnimation = 'fade' | 'slide' | 'none'

export interface ThemeObject {
  primary?: string       // Main accent color (buttons, score, active elements)
  background?: string    // Canvas background
  surface?: string       // Card/panel surfaces
  text?: string          // Primary text color
  accent?: string        // Secondary highlight color
}

export interface Score {
  game: GameName
  current: number
  personalBest: number
  isNewRecord: boolean
}

export interface GameResult {
  game: GameName
  finalScore: number
  duration: number       // ms the game was active
  isNewRecord: boolean
}

export interface LoadingGameOptions {
  game?: GameName
  active?: boolean
  theme?: ThemeObject
  size?: GameSize
  delay?: number
  minDisplay?: number
  exitAnimation?: ExitAnimation
  saveScores?: boolean
  namespace?: string
  onScore?: (score: Score) => void
  onGameOver?: (result: GameResult) => void
  onComplete?: () => void
  onError?: (err: Error) => void
}

// Plugin API (v1.1)
export interface GamePlugin {
  name: string
  bundleSize?: number    // Informational
  init(canvas: HTMLCanvasElement, theme: ThemeObject): void | Promise<void>
  start(): void
  pause(): void
  resume(): void
  destroy(): void
  getScore?(): number
}
```

---

## 6. Core Architecture

### 6.1 Web Component (`<loading-game>`)

```typescript
// packages/core/src/component.ts
// Registers a custom element that:
// 1. Observes 'game', 'active', 'theme-*', 'size' attributes
// 2. Delegates to GameController
// 3. Exposes start(), stop(), setTheme() methods imperatively

class LoadingGameElement extends HTMLElement {
  static observedAttributes = ['game', 'active', 'size', 'delay', ...]
  
  private controller: GameController
  
  connectedCallback() { /* init controller */ }
  disconnectedCallback() { /* destroy controller, clean up */ }
  attributeChangedCallback(name, oldVal, newVal) { /* delegate */ }
  
  // Imperative API
  start(): void
  stop(): void
  setTheme(theme: ThemeObject): void
}
```

### 6.2 Game Controller

```typescript
// packages/core/src/controller.ts
// Manages: delay timer, game lifecycle, score tracking, animations

class GameController {
  private delayTimer: ReturnType<typeof setTimeout> | null
  private currentGame: GamePlugin | null
  private canvas: HTMLCanvasElement
  
  async activate(options: LoadingGameOptions): Promise<void>
  async deactivate(options: { animation: ExitAnimation }): Promise<void>
  
  private async loadGame(name: GameName): Promise<GamePlugin>
  private resolveTheme(options: LoadingGameOptions): ThemeObject
}
```

### 6.3 Intelligent Delay System

```
activate() called
      │
      ▼
  Start delay timer (default 800ms)
      │
   ┌──┴──────────────────────────┐
   │ Loading resolves < delay?   │
   └──┬──────────────────────────┘
      │ Yes                  No
      ▼                       ▼
  Never render           Fade in game
                              │
                    Loading resolves while game active?
                              │ Yes
                              ▼
                    minDisplay elapsed?
                         │        │
                        Yes       No
                         │        │
                         ▼        ▼
                    Pause game  Wait remainder
                    Show "Done!" overlay
                    Fade out after 1.5s
```

### 6.4 Dynamic Game Loading

Each game is a **dynamic import** — loaded only when first needed:

```typescript
// packages/core/src/controller.ts
async function loadGame(name: GameName): Promise<GamePlugin> {
  switch (name) {
    case 'snake':
      return (await import('./games/snake/index.js')).SnakeGame
    case 'flappy':
      return (await import('./games/flappy/index.js')).FlappyGame
    // ...
  }
}
```

---

## 7. Game Specifications

### 7.1 Snake
- **Canvas size:** fills container (responsive)
- **Grid:** 20×20 cells minimum, scales up with container
- **Speed:** starts at 150ms/tick, decreases by 5ms every 5 points
- **Wrapping:** walls wrap (snake exits right, enters left)
- **Controls:** Arrow keys (keyboard), swipe (touch), virtual D-pad (mobile)
- **Score:** +10 per food eaten
- **Bundle target:** ~4 kB gzipped

### 7.2 Brick Breaker
- **Layout:** 6 rows × 10 columns of bricks
- **Power-ups:** randomly drop from destroyed bricks (wide paddle, multi-ball, slow ball — 20% drop rate)
- **Paddle:** mouse x / touch drag to position
- **Lives:** 3 balls per round
- **Score:** varies by brick row (bottom = 10pts, top = 60pts)
- **Bundle target:** ~6 kB gzipped

### 7.3 Flappy Bird
- **Gap size:** 150px, randomized vertical position
- **Gravity:** 0.4 px/frame², jump impulse: -7 px/frame
- **Pipe color:** inherits `theme.primary`
- **High score:** displayed persistently in corner
- **Score:** +1 per pipe cleared
- **Bundle target:** ~5 kB gzipped

### 7.4 2048
- **Grid:** 4×4
- **State saves:** to localStorage between sessions (even after loading completes)
- **Merge animation:** tiles scale up briefly on merge
- **Controls:** Arrow keys, swipe — does NOT capture arrow keys when not focused
- **Score:** standard 2048 scoring (tile value on merge)
- **Bundle target:** ~5 kB gzipped

### 7.5 Wordle-lite
- **Grid:** 6 rows × 5 columns
- **Word list:** 2,500 common 5-letter words, seeded by date (same word all day)
- **Virtual keyboard:** renders on touch devices
- **Color feedback:** green (correct), yellow (wrong position), gray (absent)
- **State:** persists today's attempt in localStorage
- **Bundle target:** ~7 kB gzipped (includes compressed word list)

### 7.6 Asteroids
- **Rendering:** HTML Canvas 2D, vector style
- **Controls:** Left/right arrow (rotate), up (thrust), space (shoot)
- **Particles:** ship explosion and asteroid split particles
- **Levels:** rocks split into smaller rocks × 2
- **Score:** small rock = 100, medium = 50, large = 20
- **Bundle target:** ~8 kB gzipped

### 7.7 Memory Cards
- **Grid:** 4×4 (8 pairs)
- **Card faces:** emoji symbols (universal, no font dependency)
- **Flip animation:** CSS 3D transform, 300ms
- **Match feedback:** matched cards glow in `theme.primary`
- **Score:** points for matches, bonus for speed
- **Bundle target:** ~4 kB gzipped

### 7.8 Whack-a-Mole
- **Grid:** 3×3 holes
- **Round length:** 20 seconds
- **Timing:** moles appear for 800ms–1500ms (random), rate increases over time
- **Hit feedback:** mole retracts instantly, brief visual flash
- **Score:** +1 per hit, -1 per miss (optional)
- **Bundle target:** ~4 kB gzipped

---

## 8. Framework Wrappers

### 8.1 React Wrapper

```tsx
// packages/react/src/LoadingGame.tsx
// Thin wrapper around the Web Component
// - Handles React event naming (onScore → event listener)
// - Manages ref lifecycle (attach/detach controller)
// - Full TypeScript generics

import { useEffect, useRef } from 'react'
import 'loading-games' // registers <loading-game> web component
import type { LoadingGameOptions } from 'loading-games/core'

export function LoadingGame(props: LoadingGameOptions & { className?: string }) {
  const ref = useRef<HTMLElement>(null)
  // sync props → attributes/properties
  // attach event listeners for callbacks
  return <loading-game ref={ref} />
}
```

### 8.2 Vue 3 Wrapper

```vue
<!-- packages/vue/src/LoadingGame.vue -->
<template>
  <loading-game ref="el" v-bind="attrs" />
</template>
<script setup lang="ts">
import 'loading-games'
// composable useLoadingGame also exported for programmatic use
</script>
```

### 8.3 Svelte Wrapper

```svelte
<!-- packages/svelte/src/LoadingGame.svelte -->
<script>
  import 'loading-games'
  export let game = 'random'
  export let active = false
  // ...
</script>
<loading-game {game} active={active ? 'true' : undefined} />
```

---

## 9. Theming System (CSS Variables)

The library reads and sets these CSS variables:

```css
:root {
  --lg-primary: #6366F1;      /* Main accent */
  --lg-background: #0F0F0F;   /* Canvas background */
  --lg-surface: #1A1A2E;      /* UI panels */
  --lg-text: #F8F8F8;         /* Labels, scores */
  --lg-accent: #E94560;       /* Secondary highlight */
}
```

Auto-detection logic:
1. Read `theme` prop → use directly
2. Check `:root` for `--lg-*` variables → use if present
3. Check `prefers-color-scheme` → apply built-in dark or light defaults

---

## 10. Score Persistence

```typescript
// packages/core/src/scores.ts

const STORAGE_KEY = 'loading-games'

interface ScoreStore {
  [gameKey: string]: {
    personalBest: number
    lastPlayed: string // ISO date
  }
}

function getKey(game: GameName, namespace?: string): string {
  return namespace ? `${namespace}:${game}` : game
}

export function getPersonalBest(game: GameName, namespace?: string): number
export function saveScore(game: GameName, score: number, namespace?: string): boolean // returns isNewRecord
export function clearScores(namespace?: string): void
```

---

## 11. Bundle Size Enforcement

CI pipeline uses `bundlesize` or `size-limit`:

```json
// .size-limit.json
[
  { "path": "packages/core/dist/index.js", "limit": "8 kB" },
  { "path": "packages/core/dist/games/snake.js", "limit": "10 kB" },
  { "path": "packages/core/dist/games/flappy.js", "limit": "10 kB" },
  { "path": "packages/core/dist/games/asteroids.js", "limit": "10 kB" }
]
```

**Build fails if any chunk exceeds its limit.**

---

## 12. CLI Tool (`npx loading-games init`)

```
$ npx loading-games init

✓ Detected: React (Next.js 14)
✓ Added loading-games to package.json

Copy this into your component:

  import { LoadingGame } from 'loading-games/react'

  <LoadingGame
    game="snake"
    active={isLoading}
    theme={{ primary: '#6366F1', background: '#0F0F0F' }}
  />

  Install and run: npm install && npm run dev
```

Framework detection order:
1. Check `package.json` dependencies for `react`, `vue`, `svelte`, `@angular/core`
2. Check config files (`next.config.*`, `vite.config.*`, `svelte.config.*`)
3. Fall back to vanilla JS

---

## 13. Demo Site Architecture

The demo site (hosted at `loading.games`) is built with **Astro + React islands**.

### Pages
- `/` — Hero, live game demo, code snippets, install CTA
- `/games` — All 8 games playable in-browser
- `/configurator` — Live theme + game configurator with copy-to-clipboard code
- `/docs` — Full API reference (MDX)
- `/showcase` — "Built with loading-games" gallery

### Key Components
- `<GamePlayground game={name} />` — Embeds a live game, no loading trigger needed
- `<CodeSwitcher />` — React / Vue / Svelte / Vanilla tabs with live code
- `<ThemeConfigurator />` — Color pickers that update the live game in real time and regenerate the code snippet

---

## 14. Development Setup

```bash
# Prerequisites: Node 20+, pnpm 9+

git clone https://github.com/your-org/loading-games
cd loading-games
pnpm install
pnpm build        # Build all packages
pnpm dev          # Start demo site + watch mode
pnpm test         # Run all tests
pnpm typecheck    # TypeScript across all packages
```

### Package Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build all packages with Turborepo |
| `pnpm dev` | Watch mode + demo site dev server |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm lint` | ESLint all packages |
| `pnpm typecheck` | `tsc --noEmit` all packages |
| `pnpm changeset` | Create a new changelog entry |
| `pnpm release` | Publish to npm (CI only) |

---

## 15. CI/CD (GitHub Actions)

### `ci.yml` — runs on every PR
1. Install dependencies (pnpm cache)
2. TypeScript check
3. Lint
4. Unit tests (Vitest)
5. Build all packages
6. **Bundle size check** — fails if any chunk exceeds limit
7. E2E tests (Playwright, headless Chromium)

### `release.yml` — runs on merge to `main`
1. Check for changeset
2. If present: bump versions, update CHANGELOG, publish to npm
3. Create GitHub release with notes

---

## 16. Accessibility Requirements (Must-Have)

Every game must implement:

- [ ] `canvas.setAttribute('role', 'application')`
- [ ] `canvas.setAttribute('aria-label', 'Snake game — loading in background')`
- [ ] Skip link rendered as first child: `<a href="#skip-game" class="sr-only focusable">Skip game, wait for loading</a>`
- [ ] Pause game on `document.addEventListener('visibilitychange', ...)`
- [ ] `prefers-reduced-motion` check: if `true`, render animated static pattern instead of gameplay
- [ ] Virtual D-pad for keyboard games on touch (Snake, Asteroids)
- [ ] Min touch target: 44×44px

---

## 17. Key UX Flows

### Happy Path (user plays during wait)
1. `active` → `true`
2. 800ms delay timer starts
3. If still loading after 800ms: spinner fades out, game canvas fades in (scale + opacity)
4. Overlay text for 2s: "Loading in the background — play while you wait!"
5. User plays. Score updates. New record badge if PB beaten.
6. Loading completes: game pauses mid-frame. "Done! Your export is ready." overlay.
7. Game dismisses after 1.5s. User sees result.

### Fast Load Path (< 800ms)
1. `active` → `true`
2. Loading resolves in 600ms (before 800ms delay)
3. Game never renders. No flash. User never knew it was there.

### Abandon Path
1. User is playing. Closes modal or navigates away.
2. `active` → `false`. Game pauses, fades out. No memory leaks, no orphaned `requestAnimationFrame`.

### Error Path
1. Loading request fails.
2. `onError` fires. `active` → `false` immediately.
3. Game exits instantly (no animation delay). Error UI surfaces.

---

## 18. Open Questions (Decisions Needed Before Build)

1. **Package name final:** `loading-games` ✅ (preferred) vs `waitgames` / `playload`
2. **Sub-path vs separate packages:** Use `loading-games/react` sub-path exports (preferred, cleaner `package.json` `exports` field)
3. **Sound:** Default off. Opt-in via `enableSound` prop. Lazy-load audio assets separately.
4. **Leaderboard backend (v1.1):** Simple REST endpoint or Supabase Realtime? Lean Supabase for v1.1.
5. **Monetization trigger:** Stay fully MIT open-source until 5,000 weekly npm downloads, then evaluate Pro tier (hosted leaderboard, priority support).

---

## 19. Non-Goals (v1.0)

- No React Native / Expo (v2.0)
- No multiplayer scores (v2.0)
- No sound (opt-in v1.1)
- No AI-generated themes (stretch goal)
- No game marketplace (v2.0)
- No Angular wrapper (v1.1)
- No hosted analytics (v1.2)
