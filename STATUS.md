# loading-games — Project Status Report

> Generated: 2026-03-24
> Based on: SPEC.md analysis vs. actual codebase audit

---

## Summary

The project is in **early-to-mid development**. The core architecture (types, controller, delay system, theming, scores, Web Component) is fully implemented as individual `.ts` files. Four of the eight games have code written (Snake, Flappy, Memory Cards, Whack-a-Mole). The React wrapper exists. However, the **monorepo structure described in SPEC.md has NOT been scaffolded** — all files currently live flat in the repo root or under `mnt/user-data/outputs/`, not in the `packages/core/src/` hierarchy. No `package.json`, `tsconfig.json`, `pnpm-workspace.yaml`, or `turbo.json` files exist yet.

---

## 1. Core Package (`packages/core/src/`)

### ✅ Implemented (as standalone files in repo root)

| File | Spec Section | Status | Notes |
|------|-------------|--------|-------|
| `types.ts` | §5 | ✅ Complete | All types: `GameName`, `GameSize`, `ExitAnimation`, `ThemeObject`, `Score`, `GameResult`, `LoadingGameOptions`, `GamePlugin`, `GameState`, `ResolvedTheme` |
| `theme.ts` | §9 | ✅ Complete | 3-level resolution (prop → CSS vars → system defaults), dark/light defaults, `resolveTheme()`, `applyThemeToElement()` |
| `scores.ts` | §10 | ✅ Complete | `getPersonalBest()`, `saveScore()`, `getAllScores()`, `clearScores()`, namespace scoping, SSR-safe |
| `delay.ts` | §6.3 | ✅ Complete | `DelayController` with delay timer, minDisplay logic, proper cleanup |
| `controller.ts` | §6.2 | ✅ Complete | `GameController` with full lifecycle: activate/deactivate, dynamic imports for all 8 games, DOM setup/teardown, entry/exit animations, score handling, visibility API, reduced-motion fallback, toast/completion overlay, new-record badge |
| `component.ts` | §6.1 | ✅ Complete | `LoadingGameElement` Web Component with `observedAttributes`, `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`, imperative API (`start()`, `stop()`, `setTheme()`), dev mode warning |
| `core.test.ts` | §14 | ✅ Partial | Unit tests for scores (7 tests), DelayController (4 tests), theme resolution (4 tests). Import paths reference `../src/` which won't resolve with current flat structure |

### ❌ Not Yet Implemented

| Item | Spec Section | Notes |
|------|-------------|-------|
| `index.ts` (core entry point) | §3 | The current `index.ts` is actually the **Snake game**, not the core entry point that exports `LoadingGameElement` and registers the custom element |
| Custom element registration | §6.1 | `customElements.define('loading-game', LoadingGameElement)` is never called anywhere |
| `aria-label` per game | §16 | Canvas gets `role="application"` but no game-specific aria-label like `"Snake game — loading in background"` |
| Virtual D-pad for mobile | §16 | Spec requires a virtual D-pad for keyboard-dependent games (Snake, Asteroids) on touch devices. Not implemented |
| Min 44×44px touch targets | §16 | Not explicitly enforced |

---

## 2. Games (`packages/core/src/games/`)

### ✅ Implemented (4 of 8)

| Game | Location | Spec Section | Keyboard | Touch | Theme Colors | Score Callback | Destroy Cleanup | DPR Scaling |
|------|----------|-------------|----------|-------|-------------|---------------|----------------|-------------|
| **Snake** | `index.ts` (root) | §7.1 | ✅ Arrow keys | ✅ Swipe | ✅ | ✅ | ✅ | ✅ |
| **Flappy Bird** | `mnt/.../flappy/index.ts` | §7.3 | ✅ Spacebar | ✅ Click/tap | ✅ | ✅ | ✅ | ✅ |
| **Memory Cards** | `mnt/.../memory-cards/index.ts` | §7.7 | ❌ No keyboard | ✅ Click/tap | ✅ | ✅ | ✅ | ✅ |
| **Whack-a-Mole** | `mnt/.../whack-a-mole/index.ts` | §7.8 | ❌ No keyboard | ✅ Click/tap | ✅ | ✅ | ✅ | ✅ |

#### Per-Game Notes

- **Snake**: Fully functional. Wrapping walls ✅, 20×20 grid ✅, speed increase ✅, +10 per food ✅. Missing: virtual D-pad for mobile.
- **Flappy Bird**: Fully functional. Gravity/jump physics ✅, pipe gap 150px ✅, pipe color from theme ✅, personal best shown ✅, death/retry screen ✅.
- **Memory Cards**: Functional. 4×4 grid ✅, emoji pairs ✅, flip animation (canvas-based, not CSS 3D) ✅, match detection ✅, auto-reset ✅. Missing: matched-card glow with `theme.primary` border (partially done), speed bonus scoring.
- **Whack-a-Mole**: Functional. 3×3 grid ✅, 20s rounds ✅, mole pop-up animation ✅, timer bar ✅, hit detection ✅, retry on tap ✅. Uses `setInterval` for mole spawning (spec prefers `requestAnimationFrame` only per CONTRIBUTING.md).

### ❌ Not Implemented (4 of 8)

| Game | Spec Section | Complexity | Key Requirements |
|------|-------------|-----------|-----------------|
| **2048** | §7.4 | Medium | 4×4 grid, tile merge logic, merge animation, localStorage state save, arrow keys + swipe, must NOT capture keys when unfocused |
| **Brick Breaker** | §7.2 | High | 6×10 bricks, ball physics, paddle (mouse/touch), 3 lives, power-ups (wide paddle, multi-ball, slow ball at 20% drop rate), row-based scoring |
| **Asteroids** | §7.6 | High | Vector-style rendering, ship rotation/thrust/shoot, asteroid splitting (large→medium→small), particle effects, left/right/up/space controls |
| **Wordle-lite** | §7.5 | High | 6×5 grid, green/yellow/gray feedback, virtual keyboard for mobile, date-seeded word, ~2500 compressed word list, localStorage state for today's attempt |

---

## 3. Framework Wrappers

| Wrapper | Spec Section | Status | Location | Notes |
|---------|-------------|--------|----------|-------|
| **React** | §8.1 | ✅ Implemented | `LoadingGame.tsx` (root) | Full wrapper: ref lifecycle, theme as property, event listeners for all 4 callbacks, JSX IntrinsicElements declaration, all props forwarded |
| **Vue 3** | §8.2 | ❌ File not found | — | MILESTONES.md marks it ✅ but no `.vue` or Vue wrapper file exists in the codebase |
| **Svelte** | §8.3 | ❌ File not found | — | MILESTONES.md marks it ✅ but no `.svelte` wrapper file exists in the codebase |

---

## 4. Build & Tooling

| Item | Spec Section | Status | Notes |
|------|-------------|--------|-------|
| `tsup.config.ts` | §4 | ✅ Written | Configures core, all 8 game chunks, React/Vue/Svelte wrappers. Won't work until monorepo structure exists |
| `.size-limit.json` | §11 | ✅ Written | Limits for core (8kB), each game (10kB), each wrapper (4kB) |
| `ci.yml` | §15 | ✅ Written | GitHub Actions: checkout, pnpm 9, Node 20, typecheck, lint, test, build, size-limit, codecov. Missing: Playwright E2E step |
| `pnpm-workspace.yaml` | §3 | ❌ Missing | |
| `turbo.json` | §3 | ❌ Missing | |
| Root `package.json` | §3 | ❌ Missing | |
| `tsconfig.base.json` | §3 | ❌ Missing | |
| Per-package `package.json` | §3 | ❌ Missing | None of `packages/core`, `packages/react`, `packages/vue`, `packages/svelte` exist |
| Per-package `tsconfig.json` | §3 | ❌ Missing | |
| ESLint config | §4 | ❌ Missing | |
| Prettier config | §4 | ❌ Missing | |
| Changesets config | §4 | ❌ Missing | `changeset.config.json` not created |
| `release.yml` | §15 | ❌ Missing | Only `ci.yml` exists, no release workflow |
| `bundle-size.yml` | §3 | ❌ Missing | Separate workflow per spec; currently bundled into `ci.yml` |

---

## 5. CLI Tool (`cli/`)

| Item | Spec Section | Status | Notes |
|------|-------------|--------|-------|
| CLI entry point | §12 | ✅ Implemented | `mnt/.../cli/src/index.ts` — framework detection (React/Vue/Svelte/Angular/vanilla), package manager detection (pnpm/yarn/npm), auto-install, code snippet output |
| Framework detection | §12 | ✅ Complete | Checks `package.json` deps in correct order |
| `cli/package.json` | §3 | ❌ Missing | No package.json with bin field |
| Templates directory | §3 | ❌ Missing | `cli/src/templates/` not created |

---

## 6. Demo Site (`apps/demo/`)

| Item | Spec Section | Status | Notes |
|------|-------------|--------|-------|
| Homepage | §13 | ❌ Not started | MILESTONES.md marks it ✅ but no demo files exist in codebase |
| `/games` page | §13 | ❌ Not started | |
| `/configurator` page | §13 | ❌ Not started | |
| `/docs` page | §13 | ❌ Not started | |
| `/showcase` page | §13 | ❌ Not started | |
| `<GamePlayground>` component | §13 | ❌ Not started | |
| `<CodeSwitcher>` component | §13 | ❌ Not started | |
| `<ThemeConfigurator>` component | §13 | ❌ Not started | |

---

## 7. Documentation

| Item | Status | Notes |
|------|--------|-------|
| `README.md` | ✅ Complete | Polished with Quick Start (React/Vanilla/Vue/Svelte), install, game table, config table, theming, performance, accessibility, roadmap |
| `CONTRIBUTING.md` | ✅ Complete | Game template, step-by-step guide, checklist, dev setup |
| `MILESTONES.md` | ✅ Complete | Full task breakdown across 8 milestones + backlog |
| `SPEC.md` | ✅ Complete | Comprehensive spec document |
| `docs/games/` | ❌ Missing | Per-game documentation |
| `docs/api/` | ❌ Missing | Full API reference |
| `docs/contributing/` | ❌ Missing | Extended contribution guide |
| `LICENSE` file | ❌ Missing | MIT license file not created |
| `.github/PULL_REQUEST_TEMPLATE.md` | ❌ Missing | |

---

## 8. Accessibility (§16)

| Requirement | Status | Notes |
|-------------|--------|-------|
| `role="application"` on canvas | ✅ Done | Set in `controller.ts` setupDOM |
| `aria-label` per game | ⚠️ Partial | Generic "Loading game" on host element; no game-specific label on canvas |
| Skip link | ✅ Done | Rendered as first child, sr-only, focusable, click skips game |
| `visibilitychange` pause | ✅ Done | In `controller.ts` |
| `prefers-reduced-motion` fallback | ✅ Done | Static "Loading…" text rendered |
| Virtual D-pad on touch | ❌ Missing | Required for Snake and Asteroids on mobile |
| Min 44×44px touch targets | ❌ Not enforced | |

---

## 9. UX Flows (§17)

| Flow | Status | Notes |
|------|--------|-------|
| Happy path (game shows after delay) | ✅ Implemented | Delay → show → play → complete overlay → exit |
| Fast load path (<800ms) | ✅ Implemented | DelayController cancels if end() called during delay |
| Completion overlay | ✅ Implemented | "✓ Done! Loading complete." with fade-in |
| minDisplay enforcement | ✅ Implemented | DelayController waits for remainder |
| Exit animations (fade/slide/none) | ✅ Implemented | All three work |
| Tab blur/focus pause/resume | ✅ Implemented | Via visibilitychange listener |
| Error path | ⚠️ Partial | onError fires and game tears down, but `active` isn't explicitly set to false from inside (relies on external caller) |
| Abandon path | ✅ Implemented | deactivate() pauses game, triggers exit |
| Toast overlay ("play while you wait") | ✅ Implemented | Shows for 2s then fades |
| New record badge | ✅ Implemented | Gold "🏆 New Record!" badge |

---

## 10. Critical Structural Issue

**The biggest gap is not missing code — it's the missing monorepo scaffold.** All source files are flat in the repo root or under `mnt/user-data/outputs/`. The spec requires:

```
packages/
  core/src/          ← types, theme, scores, delay, controller, component, index, games/
  react/src/         ← LoadingGame.tsx
  vue/src/           ← LoadingGame.vue
  svelte/src/        ← LoadingGame.svelte
cli/src/             ← CLI tool
apps/demo/           ← Astro demo site
```

Until this structure is created with proper `package.json`, `tsconfig.json`, and workspace configs, **nothing can build or be published to npm**.
