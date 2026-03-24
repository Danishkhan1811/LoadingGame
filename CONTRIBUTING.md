# Contributing to loading-games

Thanks for your interest in contributing! The most impactful contribution is **adding a new game**.

---

## Adding a New Game

Every game lives in `packages/core/src/games/<game-name>/index.ts` and must implement the `GamePlugin` interface.

### Step 1 — Copy the template

```bash
cp -r packages/core/src/games/snake packages/core/src/games/my-game
```

### Step 2 — Implement `GamePlugin`

```typescript
import type { GamePlugin, ThemeObject } from '../../types.js'
import { resolveTheme } from '../../theme.js'

export class MyGame implements GamePlugin {
  readonly name = 'my-game'

  private canvas!: HTMLCanvasElement
  private animFrameId: number | null = null

  constructor(private onScore?: (score: number) => void) {}

  // Called once on activation. Set up canvas, load assets.
  init(canvas: HTMLCanvasElement, theme: ThemeObject): void {
    this.canvas = canvas
    const resolved = resolveTheme(theme)
    // ... setup using resolved.primary, resolved.background, etc.
  }

  // Begin the game loop.
  start(): void {
    this.loop()
  }

  private loop(): void {
    this.animFrameId = requestAnimationFrame(() => this.loop())
    // ... update and render
  }

  // Pause — called on tab blur and when loading completes.
  pause(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
  }

  // Resume after pause.
  resume(): void {
    this.loop()
  }

  // Clean up ALL event listeners and animation frames.
  destroy(): void {
    this.pause()
    // remove event listeners
  }

  // Return current score (used for persistence).
  getScore(): number { return 0 }
}
```

### Step 3 — Register the game

Add a dynamic import in `packages/core/src/controller.ts`:

```typescript
case 'my-game':
  return (await import('./games/my-game/index.js')).MyGame
```

Add to the `GameName` union type in `packages/core/src/types.ts`:

```typescript
export type GameName = 
  | 'snake'
  | ... 
  | 'my-game'  // Add here
  | 'random'
```

### Step 4 — Add bundle size limit

Add an entry to `.size-limit.json`:

```json
{
  "name": "My Game chunk",
  "path": "packages/core/dist/games/my-game.js",
  "limit": "10 kB",
  "gzip": true
}
```

### Step 5 — Verify bundle size

```bash
pnpm build
pnpm size-limit
```

Your game chunk **must be under 10 kB gzipped**. The build will fail otherwise.

---

## Game Requirements Checklist

Before submitting a PR, verify your game:

- [ ] Implements all 5 required methods: `init`, `start`, `pause`, `resume`, `destroy`
- [ ] Uses **only** `requestAnimationFrame` for animation (no `setInterval`)
- [ ] Applies theme colors from `resolveTheme(theme)` (not hardcoded colors)
- [ ] Calls `destroy()` removes ALL event listeners
- [ ] Calls `destroy()` cancels ALL animation frames
- [ ] Scales canvas correctly for `window.devicePixelRatio`
- [ ] Has touch controls (swipe or tap)
- [ ] Has keyboard controls
- [ ] Is playable in 10–60 seconds
- [ ] Instant learnability (no instructions needed)
- [ ] Bundle size < 10 kB gzipped

---

## Dev Setup

```bash
git clone https://github.com/your-org/loading-games
cd loading-games
pnpm install
pnpm dev
```

Open the demo site at `http://localhost:3000`. Your game will be available at `/games/my-game`.

## Code Style

- TypeScript strict mode — no `any`
- No runtime dependencies
- Prettier formatting: `pnpm format`
- ESLint: `pnpm lint`

## Questions?

Open an issue or discussion on GitHub.
