/**
 * Vue 3 wrapper for loading-games
 *
 * @example
 * import { LoadingGame } from 'loading-games/vue'
 *
 * <LoadingGame game="snake" :active="isLoading" />
 */

import { defineComponent, ref, onMounted, onUnmounted, watch, h } from 'vue'
import type { ThemeObject } from '../types.js'

// Register web component
import '../index.js'

// Composable for programmatic control
export { useLoadingGame } from './composable.js'
export type { UseLoadingGameOptions, UseLoadingGameReturn } from './composable.js'

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

export const LoadingGame = defineComponent({
  name: 'LoadingGame',
  props: {
    game: { type: String, default: 'random' },
    active: { type: Boolean, default: false },
    theme: { type: Object as () => ThemeObject, default: undefined },
    size: { type: String, default: 'md' },
    delay: { type: Number, default: 800 },
    minDisplay: { type: Number, default: 0 },
    exitAnimation: { type: String, default: 'fade' },
    saveScores: { type: Boolean, default: true },
    namespace: { type: String, default: undefined },
  },
  emits: ['score', 'gameover', 'complete', 'error'],
  setup(props, { emit }) {
    const el = ref<HTMLElement | null>(null)

    const handleScore = (e: Event) => emit('score', (e as CustomEvent).detail)
    const handleGameOver = (e: Event) => emit('gameover', (e as CustomEvent).detail)
    const handleComplete = () => emit('complete')
    const handleError = (e: Event) => emit('error', (e as CustomEvent).detail)

    onMounted(() => {
      const node = el.value
      if (!node) return
      node.addEventListener('lg:score', handleScore)
      node.addEventListener('lg:gameover', handleGameOver)
      node.addEventListener('lg:complete', handleComplete)
      node.addEventListener('lg:error', handleError)
    })

    onUnmounted(() => {
      const node = el.value
      if (!node) return
      node.removeEventListener('lg:score', handleScore)
      node.removeEventListener('lg:gameover', handleGameOver)
      node.removeEventListener('lg:complete', handleComplete)
      node.removeEventListener('lg:error', handleError)
    })

    // Sync theme as property
    watch(() => props.theme, (newTheme) => {
      if (el.value && newTheme) {
        (el.value as unknown as { theme: ThemeObject }).theme = newTheme
      }
    }, { deep: true })

    return () =>
      h('loading-game', {
        ref: el,
        game: props.game,
        active: props.active ? 'true' : undefined,
        size: props.size,
        delay: String(props.delay),
        'min-display': String(props.minDisplay),
        'exit-animation': props.exitAnimation,
        'save-scores': props.saveScores ? 'true' : 'false',
        namespace: props.namespace,
      })
  },
})

export default LoadingGame
