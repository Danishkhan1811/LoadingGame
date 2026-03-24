/**
 * React wrapper for loading-games
 * 
 * @example
 * import { LoadingGame } from 'loading-games/react'
 * 
 * <LoadingGame
 *   game="snake"
 *   active={isLoading}
 *   theme={{ primary: '#6366F1', background: '#0F0F0F' }}
 *   onScore={(score) => console.log(score)}
 * />
 */

import { useEffect, useRef } from 'react'
import type { LoadingGameOptions, Score, GameResult } from '../types.js'

// Ensure the web component is registered
import '../index.js'

// Extend JSX for the custom element
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'loading-game': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        game?: string
        active?: string
        size?: string
        delay?: string
        'min-display'?: string
        'exit-animation'?: string
        'save-scores'?: string
        namespace?: string
      }
    }
  }
}

export interface LoadingGameProps extends LoadingGameOptions {
  className?: string
  style?: React.CSSProperties
}

/**
 * React component that renders a playable mini-game during loading states.
 * 
 * @param active - Controls whether the game is shown. Set true when loading begins.
 * @param game - Which game to render. Defaults to 'random'.
 */
export function LoadingGame({
  game = 'random',
  active = false,
  theme,
  size = 'md',
  delay = 800,
  minDisplay = 0,
  exitAnimation = 'fade',
  saveScores = true,
  namespace,
  onScore,
  onGameOver,
  onComplete,
  onError,
  className,
  style,
}: LoadingGameProps) {
  const ref = useRef<HTMLElement>(null)

  // Sync object props and callbacks via ref (can't pass objects as attributes)
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Set theme object as property (not attribute)
    if (theme) {
      (el as unknown as { theme: typeof theme }).theme = theme
    }
  }, [theme])

  // Attach event listeners for callbacks
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleScore = (e: Event) => onScore?.((e as CustomEvent<Score>).detail)
    const handleGameOver = (e: Event) => onGameOver?.((e as CustomEvent<GameResult>).detail)
    const handleComplete = () => onComplete?.()
    const handleError = (e: Event) => onError?.((e as CustomEvent<Error>).detail)

    el.addEventListener('lg:score', handleScore)
    el.addEventListener('lg:gameover', handleGameOver)
    el.addEventListener('lg:complete', handleComplete)
    el.addEventListener('lg:error', handleError)

    return () => {
      el.removeEventListener('lg:score', handleScore)
      el.removeEventListener('lg:gameover', handleGameOver)
      el.removeEventListener('lg:complete', handleComplete)
      el.removeEventListener('lg:error', handleError)
    }
  }, [onScore, onGameOver, onComplete, onError])

  return (
    <loading-game
      ref={ref as React.RefObject<HTMLElement>}
      game={game === 'random' ? 'random' : game}
      active={active ? 'true' : undefined}
      size={size}
      delay={String(delay)}
      min-display={String(minDisplay)}
      exit-animation={exitAnimation}
      save-scores={saveScores ? 'true' : 'false'}
      namespace={namespace}
      className={className}
      style={style}
    />
  )
}

export default LoadingGame
