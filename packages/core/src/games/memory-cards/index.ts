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
  id: number; emoji: string; flipped: boolean; matched: boolean; flipProgress: number; pulsePhase: number
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
  private selectedIdx = 0 // keyboard navigation index
  private animFrameId: number | null = null
  private running = false; private lastTime = 0
  private boundClick: (e: MouseEvent) => void
  private boundTouch: (e: TouchEvent) => void
  private boundKeyDown: (e: KeyboardEvent) => void

  constructor(private onScore?: (s: number) => void) {
    this.boundClick = this.onClick.bind(this)
    this.boundTouch = this.onTouch.bind(this)
    this.boundKeyDown = this.onKeyDown.bind(this)
  }

  init(canvas: HTMLCanvasElement, theme: ThemeObject): void {
    this.canvas = canvas; this.ctx = canvas.getContext('2d')!; this.theme = resolveTheme(theme)

    canvas.setAttribute('aria-label', 'Memory Cards game \u2014 loading in background')
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('tabindex', '0')

    const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr); canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`
    this.W = rect.width; this.H = rect.height; this.reset()
  }

  private reset(): void {
    const pairs = [...EMOJIS, ...EMOJIS]
    for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j]!, pairs[i]!] }
    this.cards = pairs.map((emoji, id) => ({ id, emoji, flipped: false, matched: false, flipProgress: 0, pulsePhase: 0 }))
    this.flippedIdxs = []; this.locked = false; this.score = 0; this.matchCount = 0
    this.startTime = Date.now(); this.selectedIdx = 0
  }

  start(): void {
    this.running = true; this.lastTime = performance.now(); this.loop(performance.now())
    this.canvas.addEventListener('click', this.boundClick)
    this.canvas.addEventListener('touchend', this.boundTouch, { passive: true })
    document.addEventListener('keydown', this.boundKeyDown)
  }

  pause(): void { this.running = false; if (this.animFrameId !== null) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null } }
  resume(): void { if (!this.running) { this.running = true; this.lastTime = performance.now(); this.loop(performance.now()) } }

  destroy(): void {
    this.pause()
    this.canvas.removeEventListener('click', this.boundClick)
    this.canvas.removeEventListener('touchend', this.boundTouch)
    document.removeEventListener('keydown', this.boundKeyDown)
  }

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

  private onKeyDown(e: KeyboardEvent): void {
    const total = this.cards.length
    switch (e.key) {
      case 'Tab':
        e.preventDefault()
        this.selectedIdx = (this.selectedIdx + (e.shiftKey ? total - 1 : 1)) % total
        break
      case 'ArrowRight': e.preventDefault(); this.selectedIdx = (this.selectedIdx + 1) % total; break
      case 'ArrowLeft': e.preventDefault(); this.selectedIdx = (this.selectedIdx + total - 1) % total; break
      case 'ArrowDown': e.preventDefault(); this.selectedIdx = (this.selectedIdx + GRID) % total; break
      case 'ArrowUp': e.preventDefault(); this.selectedIdx = (this.selectedIdx + total - GRID) % total; break
      case 'Enter':
      case ' ':
        e.preventDefault()
        this.tryFlipByIdx(this.selectedIdx)
        break
    }
  }

  private tryFlipByIdx(idx: number): void {
    if (this.locked) return
    const card = this.cards[idx]!; if (card.flipped || card.matched) return
    card.flipped = true; this.flippedIdxs.push(idx)
    this.checkMatch()
  }

  private tryFlip(x: number, y: number): void {
    if (this.locked) return
    const idx = this.cardAt(x, y); if (idx === -1) return
    const card = this.cards[idx]!; if (card.flipped || card.matched) return
    card.flipped = true; this.flippedIdxs.push(idx); this.selectedIdx = idx
    this.checkMatch()
  }

  private checkMatch(): void {
    if (this.flippedIdxs.length !== 2) return
    this.locked = true
    const [a, b] = this.flippedIdxs as [number, number]
    if (this.cards[a]!.emoji === this.cards[b]!.emoji) {
      setTimeout(() => {
        this.cards[a]!.matched = true; this.cards[b]!.matched = true
        this.matchCount++; this.score += 10; this.onScore?.(this.score)
        this.flippedIdxs = []; this.locked = false
        if (this.matchCount === EMOJIS.length) {
          // Speed bonus: reward fast completion
          const elapsed = (Date.now() - this.startTime) / 1000
          const timeBonus = Math.max(0, Math.round((60 - elapsed) * 5))
          this.score += timeBonus; this.onScore?.(this.score)
          setTimeout(() => this.reset(), 2000)
        }
      }, FLIP_MS + 100)
    } else {
      setTimeout(() => {
        this.cards[a]!.flipped = false; this.cards[b]!.flipped = false
        this.flippedIdxs = []; this.locked = false
      }, FLIP_MS + 600)
    }
  }

  private loop(now: number): void {
    if (!this.running) return
    this.animFrameId = requestAnimationFrame(t => this.loop(t))
    const dt = (now - this.lastTime) / FLIP_MS; this.lastTime = now
    for (const c of this.cards) {
      if (c.flipped && c.flipProgress < 1) c.flipProgress = Math.min(1, c.flipProgress + dt)
      else if (!c.flipped && c.flipProgress > 0) c.flipProgress = Math.max(0, c.flipProgress - dt)
      if (c.matched) c.pulsePhase = (c.pulsePhase + dt * 0.15) % (Math.PI * 2)
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
        if (card.matched) {
          // Pulsing glow for matched cards
          const pulse = 0.2 + Math.sin(card.pulsePhase) * 0.1
          ctx.fillStyle = theme.primary + '33'; ctx.fill()
          ctx.strokeStyle = theme.primary; ctx.lineWidth = 3
          ctx.globalAlpha = 0.6 + pulse; ctx.stroke(); ctx.globalAlpha = 1
          // Outer glow
          ctx.shadowColor = theme.primary; ctx.shadowBlur = 8
          ctx.stroke(); ctx.shadowBlur = 0
        } else {
          ctx.fillStyle = theme.surface; ctx.fill()
        }
        ctx.font = `${Math.min(b.w, b.h) * 0.45}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(card.emoji, b.w / 2, b.h / 2)
      } else {
        ctx.fillStyle = theme.primary + '99'; ctx.fill()
        ctx.strokeStyle = theme.primary; ctx.lineWidth = 1; ctx.globalAlpha = 0.25
        for (let j = 0; j < 3; j++) { const n = 4 + j * 5; ctx.strokeRect(n, n, b.w - n * 2, b.h - n * 2) }
        ctx.globalAlpha = 1
      }
      // Keyboard selection highlight
      if (i === this.selectedIdx) {
        ctx.strokeStyle = theme.text; ctx.lineWidth = 2; ctx.setLineDash([4, 3])
        ctx.strokeRect(0, 0, b.w, b.h); ctx.setLineDash([])
      }
      ctx.restore()
    }
    ctx.fillStyle = theme.text; ctx.globalAlpha = 0.5; ctx.font = '11px system-ui'; ctx.textAlign = 'right'
    ctx.fillText(`${this.matchCount}/${EMOJIS.length} \u00b7 ${this.score}pts`, W - 6, H - 4); ctx.globalAlpha = 1
  }
}
