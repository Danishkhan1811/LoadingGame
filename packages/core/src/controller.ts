/**
 * GameController — Orchestrates the entire game lifecycle.
 *
 * Manages:
 * - Delay timer (don't flash for fast loads)
 * - Dynamic game chunk loading
 * - Canvas setup and teardown
 * - Entry/exit animations
 * - Score callbacks
 * - Visibility API pause/resume
 * - prefers-reduced-motion fallback
 */

import type {
  GameName,
  GamePlugin,
  LoadingGameOptions,
  Score,
  GameResult,
  ExitAnimation,
  GameState,
} from './types.js'
import { resolveTheme, applyThemeToElement } from './theme.js'
import { DelayController } from './delay.js'
import { getPersonalBest, saveScore } from './scores.js'

interface ControllerCallbacks {
  onScore: (score: Score) => void
  onGameOver: (result: GameResult) => void
  onComplete: () => void
  onError: (err: Error) => void
}

const SIZE_MAP = {
  sm: { width: 280, height: 220 },
  md: { width: 400, height: 320 },
  lg: { width: 560, height: 440 },
  full: { width: 0, height: 0 }, // handled separately
}

export class GameController {
  hasEverActivated = false

  private host: HTMLElement
  private callbacks: ControllerCallbacks
  private options: LoadingGameOptions = {}
  private state: GameState = 'idle'

  private canvas: HTMLCanvasElement | null = null
  private overlay: HTMLElement | null = null
  private skipLink: HTMLAnchorElement | null = null

  private currentGame: GamePlugin | null = null
  private delayController: DelayController | null = null
  private _gameStartTime = 0
  private _currentScore = 0
  private _recordShownThisGame = false

  private boundVisibilityChange: () => void

  constructor(host: HTMLElement, callbacks: ControllerCallbacks) {
    this.host = host
    this.callbacks = callbacks
    this.boundVisibilityChange = this.handleVisibilityChange.bind(this)
    document.addEventListener('visibilitychange', this.boundVisibilityChange)
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  activate(options: LoadingGameOptions): void {
    this.hasEverActivated = true
    this.options = options
    if (this.state !== 'idle') return

    this.setState('delaying')

    this.delayController = new DelayController({
      delay: options.delay ?? 800,
      minDisplay: options.minDisplay ?? 0,
      onShow: () => this.showGame(),
      onExit: () => this.exitGame(),
    })

    this.delayController.start()
  }

  deactivate(opts: { animation: ExitAnimation }): void {
    this.options.exitAnimation = opts.animation

    if (this.state === 'delaying') {
      this.delayController?.end()
      this.setState('idle')
      return
    }

    if (this.state === 'playing') {
      this.currentGame?.pause()
      this.delayController?.end()
    }
  }

  /** Immediately tear down on error — no animation, no delay. */
  errorDeactivate(): void {
    this.delayController?.destroy()
    this.delayController = null
    this.currentGame?.destroy()
    this.currentGame = null
    this.teardownDOM()
    this.setState('idle')
  }

  updateOptions(options: LoadingGameOptions): void {
    this.options = { ...this.options, ...options }
  }

  destroy(): void {
    this.delayController?.destroy()
    this.currentGame?.destroy()
    this.currentGame = null
    this.teardownDOM()
    document.removeEventListener('visibilitychange', this.boundVisibilityChange)
  }

  // ─── Game Lifecycle ──────────────────────────────────────────────────────────

  private async showGame(): Promise<void> {
    this.setState('loading-game')

    const resolvedName = this.resolveGameName(this.options.game ?? 'random')

    try {
      const GameClass = await this.loadGameChunk(resolvedName)
      this.setupDOM()

      const theme = resolveTheme(this.options.theme)
      if (this.overlay) applyThemeToElement(this.overlay, theme)

      // Set game-specific aria-label
      if (this.canvas) {
        this.canvas.setAttribute('aria-label', `${resolvedName} game — loading in background`)
      }

      // prefers-reduced-motion: show static animation, no gameplay
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.showReducedMotionFallback(theme)
        return
      }

      this.currentGame = new GameClass(
        (score: number) => this.handleScoreUpdate(score, resolvedName),
        () => this.handleGameOverEvent(resolvedName),
      )
      await this.currentGame.init(this.canvas!, this.options.theme ?? {})

      this.setState('playing')
      this._gameStartTime = Date.now()
      this._currentScore = 0
      this._recordShownThisGame = false
      this.currentGame.start()

      this.showToast('Loading in the background — play while you wait!')
    } catch (err) {
      this.callbacks.onError(err instanceof Error ? err : new Error(String(err)))
      this.teardownDOM()
      this.setState('idle')
    }
  }

  private async exitGame(): Promise<void> {
    if (this.state === 'playing' || this.state === 'min-display') {
      this.currentGame?.pause()
      this.showCompletionOverlay()

      // Wait 1.5s then fully exit
      await this.sleep(1500)
    }

    this.setState('exiting')
    await this.animateExit(this.options.exitAnimation ?? 'fade')

    this.currentGame?.destroy()
    this.currentGame = null
    this.teardownDOM()
    this.setState('idle')
    this.callbacks.onComplete()
  }

  // ─── DOM Setup ───────────────────────────────────────────────────────────────

  private setupDOM(): void {
    const size = this.options.size ?? 'md'
    const dimensions = SIZE_MAP[size]

    // Make host a positioned container so the overlay can fill it
    if (size !== 'full') {
      Object.assign(this.host.style, {
        position: 'relative',
        display: 'block',
        overflow: 'hidden',
        // Only apply fallback min-dimensions if no explicit inline size is set
        ...(this.host.style.width ? {} : { minWidth: `${dimensions.width}px` }),
        ...(this.host.style.height ? {} : { minHeight: `${dimensions.height}px` }),
      })
    }

    // Container — fills the host for fixed sizes, fills the viewport for full
    this.overlay = document.createElement('div')
    this.overlay.setAttribute('data-lg-overlay', '')
    Object.assign(this.overlay.style, {
      position: size === 'full' ? 'fixed' : 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: size === 'full' ? '9999' : 'auto',
      opacity: '0',
      transition: 'opacity 300ms ease, transform 300ms ease',
      transform: 'scale(0.97)',
      overflow: 'hidden',
      borderRadius: size === 'full' ? '0' : '12px',
    })

    // Skip link (accessibility — must be first focusable element)
    this.skipLink = document.createElement('a')
    this.skipLink.href = '#'
    this.skipLink.textContent = 'Skip game, wait for loading'
    this.skipLink.setAttribute('data-lg-skip', '')
    Object.assign(this.skipLink.style, {
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
    })
    this.skipLink.addEventListener('focus', () => {
      Object.assign(this.skipLink!.style, { top: '8px', left: '8px' })
    })
    this.skipLink.addEventListener('blur', () => {
      Object.assign(this.skipLink!.style, { top: '-9999px', left: '-9999px' })
    })
    this.skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      this.deactivate({ animation: 'none' })
    })

    // Canvas
    this.canvas = document.createElement('canvas')
    this.canvas.setAttribute('role', 'application')
    this.canvas.setAttribute('tabindex', '0')
    Object.assign(this.canvas.style, {
      width: '100%',
      height: '100%',
      display: 'block',
    })

    this.overlay.appendChild(this.skipLink)
    this.overlay.appendChild(this.canvas)
    this.host.appendChild(this.overlay)

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.overlay) {
          this.overlay.style.opacity = '1'
          this.overlay.style.transform = 'scale(1)'
        }
      })
    })
  }

  private teardownDOM(): void {
    this.overlay?.remove()
    this.overlay = null
    this.canvas = null
    this.skipLink = null
  }

  private async animateExit(animation: ExitAnimation): Promise<void> {
    if (!this.overlay || animation === 'none') return

    if (animation === 'fade') {
      this.overlay.style.opacity = '0'
    } else if (animation === 'slide') {
      this.overlay.style.transform = 'translateY(-20px)'
      this.overlay.style.opacity = '0'
    }

    await this.sleep(350)
  }

  // ─── UI Helpers ──────────────────────────────────────────────────────────────

  private showToast(message: string): void {
    const toast = document.createElement('div')
    toast.textContent = message
    Object.assign(toast.style, {
      position: 'absolute',
      bottom: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)',
      color: '#fff',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      whiteSpace: 'nowrap',
      opacity: '0',
      transition: 'opacity 300ms ease',
      pointerEvents: 'none',
    })

    this.overlay?.appendChild(toast)
    requestAnimationFrame(() => { toast.style.opacity = '1' })

    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, 2000)
  }

  private showCompletionOverlay(): void {
    const el = document.createElement('div')
    el.textContent = '\u2713 Done! Loading complete.'
    Object.assign(el.style, {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      color: '#fff',
      fontSize: '18px',
      fontWeight: 'bold',
      fontFamily: 'system-ui, sans-serif',
      opacity: '0',
      transition: 'opacity 300ms ease',
    })
    this.overlay?.appendChild(el)
    requestAnimationFrame(() => { el.style.opacity = '1' })
  }

  private showReducedMotionFallback(theme: ReturnType<typeof resolveTheme>): void {
    if (!this.canvas) return
    const ctx = this.canvas.getContext('2d')!
    const W = this.canvas.width
    const H = this.canvas.height
    ctx.fillStyle = theme.background
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = theme.primary
    ctx.font = '16px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Loading\u2026', W / 2, H / 2)
    this.setState('playing')
  }

  // ─── Score Handling ───────────────────────────────────────────────────────────

  private handleGameOverEvent(game: Exclude<GameName, 'random'>): void {
    const duration = Date.now() - this._gameStartTime
    const personalBest = getPersonalBest(game, this.options.namespace)
    this.callbacks.onGameOver({
      game,
      finalScore: this._currentScore,
      duration,
      isNewRecord: this._currentScore > personalBest,
    })
  }

  private handleScoreUpdate(score: number, game: Exclude<GameName, 'random'>): void {
    this._currentScore = score
    const personalBest = getPersonalBest(game, this.options.namespace)
    let isNewRecord = false

    if (this.options.saveScores !== false && score > personalBest) {
      isNewRecord = saveScore(game, score, this.options.namespace)
    }

    this.callbacks.onScore({ game, current: score, personalBest: Math.max(score, personalBest), isNewRecord })

    if (isNewRecord && !this._recordShownThisGame) {
      this._recordShownThisGame = true
      this.showNewRecordBadge()
    }
  }

  private showNewRecordBadge(): void {
    const badge = document.createElement('div')
    badge.textContent = '\uD83C\uDFC6 New Record!'
    Object.assign(badge.style, {
      position: 'absolute',
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%) scale(0.8)',
      background: 'gold',
      color: '#000',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      fontFamily: 'system-ui, sans-serif',
      opacity: '0',
      transition: 'opacity 300ms ease, transform 300ms ease',
      pointerEvents: 'none',
    })
    this.overlay?.appendChild(badge)
    requestAnimationFrame(() => {
      badge.style.opacity = '1'
      badge.style.transform = 'translateX(-50%) scale(1)'
    })
    setTimeout(() => {
      badge.style.opacity = '0'
      setTimeout(() => badge.remove(), 300)
    }, 2500)
  }

  // ─── Dynamic Imports ──────────────────────────────────────────────────────────

  private async loadGameChunk(name: Exclude<GameName, 'random'>): Promise<new (onScore?: (s: number) => void, onGameOver?: () => void) => GamePlugin> {
    switch (name) {
      case 'snake':
        return (await import('./games/snake/index.js')).SnakeGame
      case 'brick-breaker':
        return (await import('./games/brick-breaker/index.js')).BrickBreakerGame
      case 'flappy':
        return (await import('./games/flappy/index.js')).FlappyGame
      case '2048':
        return (await import('./games/2048/index.js')).Game2048
      case 'wordle-lite':
        return (await import('./games/wordle-lite/index.js')).WordleLiteGame
      case 'asteroids':
        return (await import('./games/asteroids/index.js')).AsteroidsGame
      case 'memory-cards':
        return (await import('./games/memory-cards/index.js')).MemoryCardsGame
      case 'whack-a-mole':
        return (await import('./games/whack-a-mole/index.js')).WhackAMoleGame
      default:
        throw new Error(`Unknown game: ${name}`)
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private resolveGameName(name: GameName): Exclude<GameName, 'random'> {
    if (name !== 'random') return name
    const games: Exclude<GameName, 'random'>[] = [
      'snake', 'brick-breaker', 'flappy', '2048',
      'wordle-lite', 'asteroids', 'memory-cards', 'whack-a-mole',
    ]
    return games[Math.floor(Math.random() * games.length)]!
  }

  private setState(state: GameState): void {
    this.state = state
  }

  private handleVisibilityChange(): void {
    if (!this.currentGame) return
    if (document.visibilityState === 'hidden') {
      this.currentGame.pause()
    } else if (this.state === 'playing') {
      this.currentGame.resume()
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
