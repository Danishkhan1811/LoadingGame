/**
 * Svelte wrapper for loading-games
 *
 * Since Svelte handles custom elements natively, this is a thin
 * re-export that ensures the web component is registered.
 *
 * @example
 * <script>
 *   import 'loading-games/svelte'
 *   let active = false
 * </script>
 * <loading-game game="snake" active={active ? 'true' : undefined} />
 */

// Register web component
import '../index.js'

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
