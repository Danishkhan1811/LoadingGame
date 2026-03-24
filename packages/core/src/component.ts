/**
 * <loading-game> Web Component
 *
 * Registers a custom element that wraps the GameController.
 * Works in any framework or plain HTML.
 *
 * @example HTML
 * <loading-game game="snake" active="true" theme-primary="#6366F1"></loading-game>
 *
 * @example Imperative JS
 * const el = document.querySelector('loading-game')
 * el.start()
 * el.stop()
 * el.setTheme({ primary: '#E94560' })
 */

import type { GameName, GameSize, ExitAnimation, ThemeObject, LoadingGameOptions } from './types.js'
import { GameController } from './controller.js'

export class LoadingGameElement extends HTMLElement {
  static observedAttributes = [
    'game',
    'active',
    'size',
    'delay',
    'min-display',
    'exit-animation',
    'save-scores',
    'namespace',
  ]

  private controller: GameController | null = null
  private _theme: ThemeObject = {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback(): void {
    this.setAttribute('role', 'region')
    this.setAttribute('aria-label', 'Loading game')

    this.controller = new GameController(this, {
      onScore: (score) => this.dispatchEvent(new CustomEvent('lg:score', { detail: score, bubbles: true })),
      onGameOver: (result) => this.dispatchEvent(new CustomEvent('lg:gameover', { detail: result, bubbles: true })),
      onComplete: () => this.dispatchEvent(new CustomEvent('lg:complete', { bubbles: true })),
      onError: (err) => this.dispatchEvent(new CustomEvent('lg:error', { detail: err, bubbles: true })),
    })

    if (this.getAttribute('active') === 'true') {
      this.controller.activate(this.buildOptions())
    }
  }

  disconnectedCallback(): void {
    this.controller?.destroy()
    this.controller = null
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.controller) return

    if (name === 'active') {
      if (newValue === 'true') {
        this.controller.activate(this.buildOptions())
      } else {
        this.controller.deactivate({ animation: this.getExitAnimation() })
      }
    } else {
      // For other attribute changes, update the controller options
      this.controller.updateOptions(this.buildOptions())
    }
  }

  // ─── Property Setter for theme (object — can't be an attribute) ───────────

  set theme(value: ThemeObject) {
    this._theme = value
    this.controller?.updateOptions(this.buildOptions())
  }

  get theme(): ThemeObject {
    return this._theme
  }

  // ─── Imperative API ───────────────────────────────────────────────────────

  /** Start the game manually. Equivalent to setting active="true". */
  start(): void {
    this.setAttribute('active', 'true')
  }

  /** Stop the game manually. Equivalent to setting active="false". */
  stop(): void {
    this.removeAttribute('active')
  }

  /** Update the theme dynamically. */
  setTheme(theme: ThemeObject): void {
    this.theme = theme
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private buildOptions(): LoadingGameOptions {
    const game = (this.getAttribute('game') ?? 'random') as GameName
    const size = (this.getAttribute('size') ?? 'md') as GameSize
    const delay = parseInt(this.getAttribute('delay') ?? '800', 10)
    const minDisplay = parseInt(this.getAttribute('min-display') ?? '0', 10)
    const exitAnimation = (this.getAttribute('exit-animation') ?? 'fade') as ExitAnimation
    const saveScores = this.getAttribute('save-scores') !== 'false'
    const namespace = this.getAttribute('namespace') ?? undefined

    return {
      game,
      size,
      delay,
      minDisplay,
      exitAnimation,
      saveScores,
      namespace,
      theme: this._theme,
    }
  }

  private getExitAnimation(): ExitAnimation {
    return (this.getAttribute('exit-animation') ?? 'fade') as ExitAnimation
  }
}
