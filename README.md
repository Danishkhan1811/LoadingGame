# ⚡ loading-games

> A zero-friction JavaScript library that turns long loading states into playable mini-games — so users engage instead of abandoning.

[![npm version](https://img.shields.io/npm/v/loading-games)](https://npmjs.com/package/loading-games)
[![bundle size](https://img.shields.io/bundlephobia/minzip/loading-games)](https://bundlephobia.com/package/loading-games)
[![license](https://img.shields.io/github/license/DanishKhan1811/LoadingGame)](./LICENSE)

## Overview

`loading-games` is a lightweight, **zero-dependency** JavaScript library that lets developers drop playable mini-games into any loading state with a single line of code. When a fetch call, file upload, AI generation, or heavy computation takes longer than expected, instead of showing a spinner users get a fully playable game — and the session continues the moment loading completes.

**The Namco idea, finally open-sourced for the web.**

---

## Quick Start

### React
```jsx
import { LoadingGame } from 'loading-games/react'

<LoadingGame
  game="snake"
  active={isLoading}
  theme={{ primary: '#6366F1', background: '#0F0F0F' }}
  onScore={(score) => console.log(score)}
  onComplete={() => setShowResult(true)}
/>
```

### Vanilla JS / Web Component
```html
<loading-game game="flappy" active="true"></loading-game>
```

```js
import 'loading-games'

const game = document.querySelector('loading-game')
game.setAttribute('active', 'true')  // start
game.removeAttribute('active')       // stop
game.theme = { primary: '#E94560', background: '#0F0F0F' }
```

### Vue 3
```vue
<script setup>
import { LoadingGame } from 'loading-games/vue'
import { ref } from 'vue'
const isLoading = ref(true)
</script>

<template>
  <LoadingGame game="snake" :active="isLoading" @complete="isLoading = false" />
</template>
```

### Svelte
```svelte
<script>
  import 'loading-games'
  let active = true
</script>

<loading-game game="snake" active={active ? 'true' : undefined}
  on:lg:complete={() => active = false} />
```

---

## Installation

```bash
npm install loading-games
# or
yarn add loading-games
# or
pnpm add loading-games
```

**CLI scaffolding (auto-detects framework):**
```bash
npx loading-games init
```

---

## Games (v1.0)

| Game | Controls | Bundle | Status |
|------|----------|--------|--------|
| `snake` | Arrow keys / swipe / D-pad | ~4 kB | ✅ Complete |
| `flappy` | Spacebar / tap | ~5 kB | ✅ Complete |
| `memory-cards` | Mouse / tap / keyboard | ~4 kB | ✅ Complete |
| `whack-a-mole` | Mouse / tap / keys 1-9 | ~4 kB | ✅ Complete |
| `brick-breaker` | Mouse / touch drag | ~6 kB | 🔲 Stub (v1.1) |
| `2048` | Arrow keys / swipe | ~5 kB | 🔲 Stub (v1.1) |
| `wordle-lite` | Keyboard / virtual kb | ~7 kB | 🔲 Stub (v1.1) |
| `asteroids` | Arrow keys + space | ~8 kB | 🔲 Stub (v1.1) |

---

## Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `game` | `GameName \| 'random'` | `'random'` | Which game to render |
| `active` | `boolean` | `false` | Starts/stops the game |
| `theme` | `ThemeObject` | auto-detect | Colors: primary, background, surface, text, accent |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Preset sizes. `'full'` overlays viewport |
| `delay` | `number` (ms) | `800` | Wait before showing game (prevents flash) |
| `minDisplay` | `number` (ms) | `0` | Minimum display time once shown |
| `exitAnimation` | `'fade' \| 'slide' \| 'none'` | `'fade'` | How the game disappears |
| `saveScores` | `boolean` | `true` | Persists personal bests in localStorage |
| `namespace` | `string` | `undefined` | Scopes score storage per instance |
| `onScore` | `(score: Score) => void` | — | Fires on every score change |
| `onGameOver` | `(result: Result) => void` | — | Fires when a game round ends |
| `onError` | `(err: Error) => void` | — | Fires on loading error; exits game immediately |
| `onComplete` | `() => void` | — | Fires when exit animation finishes (game fully removed) |

---

## Theming

Priority order (highest first):
1. Explicit `theme` prop/attribute
2. CSS variables on `:root` — `--lg-primary`, `--lg-background`, `--lg-surface`, `--lg-text`, `--lg-accent`
3. System `prefers-color-scheme` detection

---

## Performance Budget

- **Core entry point:** < 8 kB gzipped
- **Per game chunk:** < 10 kB gzipped  
- **Lazy loading:** Games fetched only on first `active=true`
- **Zero runtime dependencies**
- **60fps target:** `requestAnimationFrame` only, no DOM thrashing

---

## Accessibility

- `role="application"` + `aria-label` on every canvas
- Skip link ("Skip game, wait for loading") — always first tab stop
- `prefers-reduced-motion`: static animated pattern fallback
- WCAG AA contrast in all default themes
- Auto-pause on `document.visibilityState = 'hidden'`
- Virtual D-pad on touch for keyboard-dependent games
- Min 44×44px tap zones (WCAG 2.5.5 AAA)

---

## Roadmap

| Phase | Timeline | Scope |
|-------|----------|-------|
| **v1.0** | Week 1–6 | Core lib, 8 games, React/Vue/Svelte, TypeScript, demo site, PH launch |
| **v1.1** | Week 7–10 | Custom game plugin API, shared leaderboard, Angular wrapper |
| **v1.2** | Week 11–14 | Analytics hook, WCAG AA certification, 3 community games |
| **v2.0** | Month 4+ | Multiplayer scores, game marketplace, React Native (Expo) |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for game contribution guidelines and the game template.

## License

MIT
