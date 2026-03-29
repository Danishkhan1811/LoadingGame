/**
 * Asteroids — Stub implementation.
 * Full implementation planned for Phase 3.
 * Bundle target: ~8 kB gzipped
 */

import type { GamePlugin, ThemeObject, ResolvedTheme } from '../../types.js'
import { resolveTheme } from '../../theme.js'

export class AsteroidsGame implements GamePlugin {
  readonly name = 'asteroids'
  readonly bundleSize = 8_000

  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private theme!: ResolvedTheme
  private animFrameId: number | null = null
  private running = false
  private score = 0

  constructor(private _onScore?: (s: number) => void, private _onGameOver?: () => void) {}

  init(canvas: HTMLCanvasElement, theme: ThemeObject): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.theme = resolveTheme(theme)
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
  }

  start(): void { this.running = true; this.render() }
  pause(): void { this.running = false; if (this.animFrameId !== null) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null } }
  resume(): void { if (!this.running) { this.running = true; this.render() } }
  destroy(): void { this.pause() }
  getScore(): number { return this.score }

  private render(): void {
    const rect = this.canvas.getBoundingClientRect()
    const W = rect.width, H = rect.height
    const { ctx, theme } = this
    ctx.fillStyle = theme.background; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = theme.text; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('Asteroids', W / 2, H / 2 - 16)
    ctx.font = '14px system-ui'; ctx.globalAlpha = 0.6
    ctx.fillText('Coming soon!', W / 2, H / 2 + 16); ctx.globalAlpha = 1
  }
}
