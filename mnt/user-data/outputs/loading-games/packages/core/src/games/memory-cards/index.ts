/**
 * Memory Cards — Emoji pair matching game.
 * Bundle target: ~4 kB gzipped
 * See SPEC.md §7.7 for full spec.
 */

import type { GamePlugin, ThemeObject, ResolvedTheme } from '../../types.js'
import { resolveTheme } from '../../theme.js'

const EMOJIS = ['🎮','🚀','🎯','🎲','🌟','🎸','🦄','🍕']
const GRID = 4
const FLIP_MS = 300

interface Card {
  id: number; emoji: string; flipped: boolean; matched: boolean; flipProgress: number
}

export class MemoryCardsGame implements GamePlugin {
  readonly name = 'memory-cards'
  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private theme!: ResolvedTheme
  private W = 0; private H = 0
  private cards: Card[] = []
  private flippedIdxs: number[] = []
  private locked = false
  private score = 0; private matchCount = 0; private startTime = 0
  private animFrameId: number | null = null
  private running = false; private lastTime = 0
  private boundClick: (e: MouseEvent) => void
  private boundTouch: (e: TouchEvent) => void

  constructor(private onScore?: (s: number) => void) {
    this.boundClick = this.onClick.bind(this)
    this.boundTouch = this.onTouch.bind(this)
  }

  init(canvas: HTMLCanvasElement, theme: ThemeObject): void {
    this.canvas = canvas; this.ctx = canvas.getContext('2d')!; this.theme = resolveTheme(theme)
    const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr); canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`
    this.W = rect.width; this.H = rect.height; this.reset()
  }

  private reset(): void {
    const pairs = [...EMOJIS, ...EMOJIS]
    for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j]!, pairs[i]!] }
    this.cards = pairs.map((emoji, id) => ({ id, emoji, flipped: false, matched: false, flipProgress: 0 }))
    this.flippedIdxs = []; this.locked = false; this.score = 0; this.matchCount = 0; this.startTime = Date.now()
  }

  start(): void {
    this.running = true; this.lastTime = performance.now(); this.loop(performance.now())
    this.canvas.addEventListener('click', this.boundClick)
    this.canvas.addEventListener('touchend', this.boundTouch, { passive: true })
  }

  pause(): void { this.running = false; if (this.animFrameId !== null) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null } }
  resume(): void { if (!this.running) { this.running = true; this.lastTime = performance.now(); this.loop(performance.now()) } }
  destroy(): void { this.pause(); this.canvas.removeEventListener('click', this.boundClick); this.canvas.removeEventListener('touchend', this.boundTouch) }
  getScore(): number { return this.score }

  private bounds(i: number) {
    const pad = 8; const cols = GRID; const rows = GRID
    const w = (this.W - pad * (cols + 1)) / cols; const h = (this.H - pad * (rows + 1)) / rows
    return { x: pad + (i % cols) * (w + pad), y: pad + Math.floor(i / cols) * (h + pad), w, h }
  }

  private cardAt(px: number, py: number): number {
    for (let i = 0; i < this.cards.length; i++) { const b = this.bounds(i); if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return i }
    return -1
  }

  private onClick(e: MouseEvent): void { const r = this.canvas.getBoundingClientRect(); this.tryFlip(e.clientX - r.left, e.clientY - r.top) }
  private onTouch(e: TouchEvent): void { const t = e.changedTouches[0]; if (!t) return; const r = this.canvas.getBoundingClientRect(); this.tryFlip(t.clientX - r.left, t.clientY - r.top) }

  private tryFlip(x: number, y: number): void {
    if (this.locked) return
    const idx = this.cardAt(x, y); if (idx === -1) return
    const card = this.cards[idx]!; if (card.flipped || card.matched) return
    card.flipped = true; this.flippedIdxs.push(idx)
    if (this.flippedIdxs.length === 2) {
      this.locked = true
      const [a, b] = this.flippedIdxs as [number, number]
      if (this.cards[a]!.emoji === this.cards[b]!.emoji) {
        setTimeout(() => {
          this.cards[a]!.matched = true; this.cards[b]!.matched = true
          this.matchCount++; this.score += 10; this.onScore?.(this.score)
          this.flippedIdxs = []; this.locked = false
          if (this.matchCount === EMOJIS.length) setTimeout(() => this.reset(), 2000)
        }, FLIP_MS + 100)
      } else {
        setTimeout(() => {
          this.cards[a]!.flipped = false; this.cards[b]!.flipped = false
          this.flippedIdxs = []; this.locked = false
        }, FLIP_MS + 600)
      }
    }
  }

  private loop(now: number): void {
    if (!this.running) return
    this.animFrameId = requestAnimationFrame(t => this.loop(t))
    const dt = (now - this.lastTime) / FLIP_MS; this.lastTime = now
    for (const c of this.cards) {
      if (c.flipped && c.flipProgress < 1) c.flipProgress = Math.min(1, c.flipProgress + dt)
      else if (!c.flipped && c.flipProgress > 0) c.flipProgress = Math.max(0, c.flipProgress - dt)
    }
    this.render()
  }

  private render(): void {
    const { ctx, W, H, theme } = this
    ctx.fillStyle = theme.background; ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i]!; const b = this.bounds(i)
      const scaleX = Math.abs(Math.cos(card.flipProgress * Math.PI))
      const cx = b.x + b.w / 2; const cy = b.y + b.h / 2
      ctx.save(); ctx.translate(cx, cy); ctx.scale(scaleX, 1); ctx.translate(-b.w / 2, -b.h / 2)
      ctx.beginPath(); ctx.roundRect(0, 0, b.w, b.h, 6)
      if (card.flipProgress > 0.5) {
        ctx.fillStyle = card.matched ? theme.primary + '33' : theme.surface; ctx.fill()
        if (card.matched) { ctx.strokeStyle = theme.primary; ctx.lineWidth = 2; ctx.stroke() }
        ctx.font = `${Math.min(b.w, b.h) * 0.45}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(card.emoji, b.w / 2, b.h / 2)
      } else {
        ctx.fillStyle = theme.primary + '99'; ctx.fill()
        ctx.strokeStyle = theme.primary; ctx.lineWidth = 1; ctx.globalAlpha = 0.25
        for (let j = 0; j < 3; j++) { const n = 4 + j * 5; ctx.strokeRect(n, n, b.w - n * 2, b.h - n * 2) }
        ctx.globalAlpha = 1
      }
      ctx.restore()
    }
    ctx.fillStyle = theme.text; ctx.globalAlpha = 0.5; ctx.font = '11px system-ui'; ctx.textAlign = 'right'
    ctx.fillText(`${this.matchCount}/${EMOJIS.length} · ${this.score}pts`, W - 6, H - 4); ctx.globalAlpha = 1
  }
}
