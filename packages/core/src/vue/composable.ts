/**
 * useLoadingGame — Vue 3 composable for programmatic control
 *
 * Provides reactive state and methods to control a loading-game
 * element without using the <LoadingGame> component directly.
 *
 * @example
 * const { el, start, stop, setTheme, isActive } = useLoadingGame({
 *   game: 'snake',
 *   onScore: (s) => console.log(s),
 * })
 *
 * // In template: <div ref="el" />
 * // Or mount imperatively into any container
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import type {
  GameName,
  GameSize,
  ExitAnimation,
  ThemeObject,
  Score,
  GameResult,
} from '../types.js'

// Ensure web component is registered
import '../index.js'

export interface UseLoadingGameOptions {
  /** Which game to render. @default 'random' */
  game?: GameName
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

export interface UseLoadingGameReturn {
  /** Ref to bind to a container element. The web component will be created inside it. */
  containerRef: Ref<HTMLElement | null>
  /** Reactive active state. */
  isActive: Ref<boolean>
  /** Start the game (set active=true). */
  start: () => void
  /** Stop the game (set active=false). */
  stop: () => void
  /** Update the theme at runtime. */
  setTheme: (theme: ThemeObject) => void
  /** The underlying <loading-game> element, if mounted. */
  element: Ref<HTMLElement | null>
}

export function useLoadingGame(options: UseLoadingGameOptions = {}): UseLoadingGameReturn {
  const containerRef = ref<HTMLElement | null>(null)
  const element = ref<HTMLElement | null>(null)
  const isActive = ref(false)

  let lgElement: HTMLElement | null = null

  function createAttributes(): Record<string, string | undefined> {
    return {
      game: options.game ?? 'random',
      size: options.size ?? 'md',
      delay: String(options.delay ?? 800),
      'min-display': String(options.minDisplay ?? 0),
      'exit-animation': options.exitAnimation ?? 'fade',
      'save-scores': (options.saveScores ?? true) ? 'true' : 'false',
      namespace: options.namespace,
    }
  }

  function handleScore(e: Event) {
    options.onScore?.((e as CustomEvent<Score>).detail)
  }
  function handleGameOver(e: Event) {
    options.onGameOver?.((e as CustomEvent<GameResult>).detail)
  }
  function handleComplete() {
    isActive.value = false
    options.onComplete?.()
  }
  function handleError(e: Event) {
    isActive.value = false
    options.onError?.((e as CustomEvent<Error>).detail)
  }

  onMounted(() => {
    const container = containerRef.value
    if (!container) return

    lgElement = document.createElement('loading-game')

    // Set attributes
    const attrs = createAttributes()
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined) {
        lgElement.setAttribute(key, value)
      }
    }

    // Set theme as property
    if (options.theme) {
      (lgElement as unknown as { theme: ThemeObject }).theme = options.theme
    }

    // Attach event listeners
    lgElement.addEventListener('lg:score', handleScore)
    lgElement.addEventListener('lg:gameover', handleGameOver)
    lgElement.addEventListener('lg:complete', handleComplete)
    lgElement.addEventListener('lg:error', handleError)

    container.appendChild(lgElement)
    element.value = lgElement
  })

  onUnmounted(() => {
    if (lgElement) {
      lgElement.removeEventListener('lg:score', handleScore)
      lgElement.removeEventListener('lg:gameover', handleGameOver)
      lgElement.removeEventListener('lg:complete', handleComplete)
      lgElement.removeEventListener('lg:error', handleError)
      lgElement.remove()
      lgElement = null
      element.value = null
    }
  })

  function start() {
    isActive.value = true
    lgElement?.setAttribute('active', 'true')
  }

  function stop() {
    isActive.value = false
    lgElement?.removeAttribute('active')
  }

  function setTheme(theme: ThemeObject) {
    if (lgElement) {
      (lgElement as unknown as { theme: ThemeObject }).theme = theme
    }
  }

  return {
    containerRef,
    isActive,
    start,
    stop,
    setTheme,
    element,
  }
}
