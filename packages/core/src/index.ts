/**
 * loading-games — Main entry point
 *
 * Exports the Web Component, types, and utilities.
 * Auto-registers <loading-game> custom element on import.
 */

export { LoadingGameElement } from './component.js'
export { GameController } from './controller.js'

// Types
export type {
  GameName,
  GameSize,
  ExitAnimation,
  ThemeObject,
  Score,
  GameResult,
  LoadingGameOptions,
  GamePlugin,
  GameState,
  ResolvedTheme,
} from './types.js'

// Utilities
export { resolveTheme, applyThemeToElement } from './theme.js'
export { getPersonalBest, saveScore, getAllScores, clearScores } from './scores.js'
export { DelayController } from './delay.js'

// Auto-register custom element
import { LoadingGameElement } from './component.js'

if (typeof customElements !== 'undefined' && !customElements.get('loading-game')) {
  customElements.define('loading-game', LoadingGameElement)
}
