/**
 * Svelte wrapper for loading-games
 *
 * Provides a Svelte action and a factory function for programmatic control.
 * Svelte handles custom elements natively, so the <loading-game> element
 * can also be used directly in templates after importing this module.
 *
 * @example Using the Svelte action
 * <script>
 *   import { loadingGame } from 'loading-games/svelte'
 *   let active = false
 * </script>
 * <div use:loadingGame={{ game: 'snake', active }}>
 *
 * @example Direct web component usage
 * <script>
 *   import 'loading-games/svelte'
 *   let active = false
 * </script>
 * <loading-game game="snake" active={active ? 'true' : undefined} />
 */

// Register web component
import '../index.js'

import type {
  GameName,
  GameSize,
  ExitAnimation,
  ThemeObject,
  Score,
  GameResult,
} from '../types.js'

// Re-export types for convenience
export type {
  GameName,
  GameSize,
  ExitAnimation,
  ThemeObject,
  LoadingGameOptions,
  Score,
  GameResult,
} from '../types.js'

// ─── Action Options ──────────────────────────────────────────────────────────

export interface LoadingGameActionOptions {
  /** Which game to render. @default 'random' */
  game?: GameName
  /** Controls whether the game is shown. @default false */
  active?: boolean
  /** Container size preset. @default 'md' */
  size?: GameSize
  /** Milliseconds before showing the game. @default 800 */
  delay?: number
  /** Minimum display time once game appears. @default 0 */
  minDisplay?: number
  /** Exit animation style. @default 'fade' */
  exitAnimation?: ExitAnimation
  /** Persist scores to localStorage. @default true */
  saveScores?: boolean
  /** Score storage namespace. */
  namespace?: string
  /** Theme overrides. */
  theme?: ThemeObject
  /** Fires on every score change. */
  onScore?: (score: Score) => void
  /** Fires when a game round ends. */
  onGameOver?: (result: GameResult) => void
  /** Fires when loading completes and game exits. */
  onComplete?: () => void
  /** Fires on error. */
  onError?: (err: Error) => void
}

// ─── Svelte Action ───────────────────────────────────────────────────────────

/**
 * Svelte action that creates and manages a <loading-game> element.
 *
 * @example
 * <div use:loadingGame={{ game: 'snake', active: isLoading }} />
 */
export function loadingGame(node: HTMLElement, options: LoadingGameActionOptions = {}) {
  const el = document.createElement('loading-game')
  syncAttributes(el, options)

  if (options.theme) {
    (el as unknown as { theme: ThemeObject }).theme = options.theme
  }

  const handlers = attachListeners(el, options)
  node.appendChild(el)

  return {
    update(newOptions: LoadingGameActionOptions) {
      syncAttributes(el, newOptions)

      if (newOptions.theme) {
        (el as unknown as { theme: ThemeObject }).theme = newOptions.theme
      }

      // Reattach listeners if callbacks changed
      removeListeners(el, handlers)
      const newHandlers = attachListeners(el, newOptions)
      Object.assign(handlers, newHandlers)
      options = newOptions
    },
    destroy() {
      removeListeners(el, handlers)
      el.remove()
    },
  }
}

// ─── Programmatic Factory ────────────────────────────────────────────────────

export interface LoadingGameInstance {
  /** Start the game (set active=true). */
  start: () => void
  /** Stop the game (set active=false). */
  stop: () => void
  /** Update the theme at runtime. */
  setTheme: (theme: ThemeObject) => void
  /** Remove the element and clean up. */
  destroy: () => void
  /** The underlying <loading-game> element. */
  element: HTMLElement
}

/**
 * Programmatically create a loading-game instance inside a container.
 *
 * @example
 * const game = createLoadingGame(containerEl, { game: 'flappy' })
 * game.start()
 * // later...
 * game.stop()
 * game.destroy()
 */
export function createLoadingGame(
  container: HTMLElement,
  options: LoadingGameActionOptions = {},
): LoadingGameInstance {
  const el = document.createElement('loading-game')
  syncAttributes(el, options)

  if (options.theme) {
    (el as unknown as { theme: ThemeObject }).theme = options.theme
  }

  const handlers = attachListeners(el, options)
  container.appendChild(el)

  return {
    start() {
      el.setAttribute('active', 'true')
    },
    stop() {
      el.removeAttribute('active')
    },
    setTheme(theme: ThemeObject) {
      (el as unknown as { theme: ThemeObject }).theme = theme
    },
    destroy() {
      removeListeners(el, handlers)
      el.remove()
    },
    element: el,
  }
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

interface ListenerMap {
  score: (e: Event) => void
  gameover: (e: Event) => void
  complete: () => void
  error: (e: Event) => void
}

function syncAttributes(el: HTMLElement, options: LoadingGameActionOptions): void {
  el.setAttribute('game', options.game ?? 'random')
  el.setAttribute('size', options.size ?? 'md')
  el.setAttribute('delay', String(options.delay ?? 800))
  el.setAttribute('min-display', String(options.minDisplay ?? 0))
  el.setAttribute('exit-animation', options.exitAnimation ?? 'fade')
  el.setAttribute('save-scores', (options.saveScores ?? true) ? 'true' : 'false')

  if (options.namespace) {
    el.setAttribute('namespace', options.namespace)
  } else {
    el.removeAttribute('namespace')
  }

  if (options.active) {
    el.setAttribute('active', 'true')
  } else {
    el.removeAttribute('active')
  }
}

function attachListeners(el: HTMLElement, options: LoadingGameActionOptions): ListenerMap {
  const handlers: ListenerMap = {
    score: (e: Event) => options.onScore?.((e as CustomEvent<Score>).detail),
    gameover: (e: Event) => options.onGameOver?.((e as CustomEvent<GameResult>).detail),
    complete: () => options.onComplete?.(),
    error: (e: Event) => options.onError?.((e as CustomEvent<Error>).detail),
  }

  el.addEventListener('lg:score', handlers.score)
  el.addEventListener('lg:gameover', handlers.gameover)
  el.addEventListener('lg:complete', handlers.complete)
  el.addEventListener('lg:error', handlers.error)

  return handlers
}

function removeListeners(el: HTMLElement, handlers: ListenerMap): void {
  el.removeEventListener('lg:score', handlers.score)
  el.removeEventListener('lg:gameover', handlers.gameover)
  el.removeEventListener('lg:complete', handlers.complete)
  el.removeEventListener('lg:error', handlers.error)
}
