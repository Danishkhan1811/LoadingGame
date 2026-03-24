/**
 * loading-games — TypeScript Types
 * 
 * This file is the single source of truth for all types.
 * Re-export from here in all packages.
 */

// ─── Game Names ───────────────────────────────────────────────────────────────

/** All built-in game identifiers. 'random' selects a different game each time. */
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

// ─── Configuration ────────────────────────────────────────────────────────────

/** Size presets. 'full' creates a full-viewport overlay. */
export type GameSize = 'sm' | 'md' | 'lg' | 'full'

/** Animation played when loading completes and the game exits. */
export type ExitAnimation = 'fade' | 'slide' | 'none'

/**
 * Theme color tokens.
 * All fields optional — unset values fall back to CSS variables or system defaults.
 * 
 * @example
 * { primary: '#6366F1', background: '#0F0F0F' }
 */
export interface ThemeObject {
  /** Main accent color — buttons, score, active game elements */
  primary?: string
  /** Canvas / component background */
  background?: string
  /** Card and panel surfaces */
  surface?: string
  /** Primary text (labels, scores, UI) */
  text?: string
  /** Secondary highlight / accent */
  accent?: string
}

// ─── Score & Results ──────────────────────────────────────────────────────────

/** Fired on every score change via onScore callback. */
export interface Score {
  game: Exclude<GameName, 'random'>
  /** Current score in this session */
  current: number
  /** All-time personal best (from localStorage) */
  personalBest: number
  /** true if current just exceeded the previous personal best */
  isNewRecord: boolean
}

/** Fired when a game round ends (not when loading ends). */
export interface GameResult {
  game: Exclude<GameName, 'random'>
  finalScore: number
  /** How long the game was active in milliseconds */
  duration: number
  isNewRecord: boolean
}

// ─── Main Options ─────────────────────────────────────────────────────────────

/**
 * Complete configuration for a LoadingGame instance.
 * All fields optional — sensible defaults apply.
 * 
 * @example
 * {
 *   game: 'snake',
 *   active: isLoading,
 *   theme: { primary: '#6366F1', background: '#0F0F0F' },
 *   onScore: (s) => console.log(s),
 * }
 */
export interface LoadingGameOptions {
  /**
   * Which game to render.
   * 'random' selects a different game each activation.
   * @default 'random'
   */
  game?: GameName

  /**
   * Controls whether the game is shown.
   * Set to true when loading begins, false when it ends.
   * @default false
   */
  active?: boolean

  /**
   * Theme color overrides.
   * Merged with CSS variables and system color scheme.
   */
  theme?: ThemeObject

  /**
   * Container size preset.
   * 'full' renders a full-viewport overlay.
   * @default 'md'
   */
  size?: GameSize

  /**
   * Milliseconds to wait before showing the game.
   * Prevents a jarring flash for fast loads.
   * If loading completes before delay, game never renders.
   * @default 800
   */
  delay?: number

  /**
   * Minimum milliseconds to show the game once it appears.
   * Prevents a confusing half-second flash.
   * @default 0
   */
  minDisplay?: number

  /**
   * Animation when the game exits after loading completes.
   * @default 'fade'
   */
  exitAnimation?: ExitAnimation

  /**
   * Persist personal bests in localStorage.
   * @default true
   */
  saveScores?: boolean

  /**
   * Namespace for score storage.
   * Allows multiple instances to maintain separate leaderboards.
   * @default undefined (global namespace)
   */
  namespace?: string

  // ─── Callbacks ───────────────────────────────────────────────────────────

  /** Fires every time the score changes. */
  onScore?: (score: Score) => void

  /** Fires when a game round ends (game over, not loading end). */
  onGameOver?: (result: GameResult) => void

  /**
   * Fires when loading completes and the game has fully exited.
   * Use this to trigger post-load UI updates.
   */
  onComplete?: () => void

  /**
   * Fires when loading fails.
   * The game exits immediately, without animation.
   */
  onError?: (err: Error) => void
}

// ─── Plugin API (v1.1) ────────────────────────────────────────────────────────

/**
 * Interface for custom game plugins.
 * Implement this to register your own game via registerGame().
 * 
 * @example
 * class MyGame implements GamePlugin {
 *   name = 'my-game'
 *   init(canvas, theme) { ... }
 *   start() { ... }
 *   pause() { ... }
 *   resume() { ... }
 *   destroy() { ... }
 * }
 */
export interface GamePlugin {
  /** Unique identifier used in the game prop */
  readonly name: string

  /** Approximate gzipped bundle size in bytes (informational) */
  readonly bundleSize?: number

  /**
   * Initialize the game. Set up canvas, load assets.
   * Called once per activation. May be async.
   */
  init(canvas: HTMLCanvasElement, theme: ThemeObject): void | Promise<void>

  /** Begin the game loop. Called after init completes. */
  start(): void

  /** Pause the game loop. Called on tab blur and when loading completes. */
  pause(): void

  /** Resume from pause. Called on tab focus if loading is still active. */
  resume(): void

  /**
   * Fully clean up. Cancel all requestAnimationFrame callbacks,
   * remove all event listeners, release resources.
   * Called when active becomes false or component unmounts.
   */
  destroy(): void

  /** Return the current score. Called by the score persistence system. */
  getScore?(): number
}

// ─── Internal Types ───────────────────────────────────────────────────────────

/** Internal game lifecycle states */
export type GameState =
  | 'idle'        // active=false, no game shown
  | 'delaying'    // active=true, waiting for delay timer
  | 'loading-game' // fetching game chunk
  | 'playing'     // game active and rendering
  | 'min-display' // loading complete, waiting for minDisplay
  | 'exiting'     // playing exit animation
  | 'complete'    // fully exited

/** Resolved theme — all fields required after theme resolution */
export interface ResolvedTheme {
  primary: string
  background: string
  surface: string
  text: string
  accent: string
}
