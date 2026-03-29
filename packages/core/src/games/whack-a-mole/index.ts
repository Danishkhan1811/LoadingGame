/**
 * Whack-a-Mole — Touch-first, 3×3 grid, 20-second rounds.
 *
 * Mechanics:
 * - 3×3 holes, moles appear for 800–1500ms
 * - 20-second timed round, spawn rate accelerates from 900ms→500ms
 * - +1 per hit, high score is very shareable
 *
 * Controls: Mouse click / tap / keyboard 1-9
 * Bundle target: ~4 kB gzipped
 */

import type { GamePlugin, ThemeObject, ResolvedTheme } from '../../types.js'
import { resolveTheme } from '../../theme.js'

const GRID = 3
const ROUND_DURATION = 20_000
const HOLE_COUNT = GRID * GRID
const SPAWN_START_MS = 900
const SPAWN_END_MS = 500
const MOLE_MIN_STAY = 800
const MOLE_STAY_RANGE = 700

interface Hole {
  active: boolean
  showProgress: number
  hideAt: number // timestamp when mole auto-hides (0 = no mole)
  hit: boolean
  hitProgress: number
}

export class WhackAMoleGame implements GamePlugin {
  readonly name = 'whack-a-mole'
  readonly bundleSize = 4_000

  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private theme!: ResolvedTheme
  private W = 0; private H = 0

  private holes: Hole[] = []
  private score = 0
  private timeLeft = ROUND_DURATION
  private roundStart = 0
  private animFrameId: number | null = null
  private running = false
  private lastTime = 0
  private roundOver = false
  private nextSpawnTime = 0

  private boundClick: (e: MouseEvent) => void
  private boundTouch: (e: TouchEvent) => void
  private boundKeyDown: (e: KeyboardEvent) => void

  private onScore?: (s: number) => void
  private onGameOver?: () => void

  constructor(onScore?: (s: number) => void, onGameOver?: () => void) {
    this.onScore = onScore
    this.onGameOver = onGameOver
    this.boundClick = this.onClick.bind(this)
    this.boundTouch = this.onTouch.bind(this)
    this.boundKeyDown = this.onKeyDown.bind(this)
  }

  init(canvas: HTMLCanvasElement, theme: ThemeObject): void {
    this.canvas = canvas; this.ctx = canvas.getContext('2d')!; this.theme = resolveTheme(theme)

    canvas.setAttribute('aria-label', 'Whack-a-Mole game \u2014 loading in background')
    canvas.setAttribute('role', 'img')

    const dpr = window.devicePixelRatio || 1; const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr); canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`
    this.W = rect.width; this.H = rect.height
    this.reset()
  }

  private reset(): void {
    this.holes = Array.from({ length: HOLE_COUNT }, () => ({
      active: false, showProgress: 0, hideAt: 0, hit: false, hitProgress: 0,
    }))
    this.score = 0; this.timeLeft = ROUND_DURATION; this.roundOver = false
    this.nextSpawnTime = 0
  }

  start(): void {
    this.running = true; this.roundStart = performance.now(); this.lastTime = performance.now()
    this.nextSpawnTime = performance.now()
    this.loop(performance.now())
    this.canvas.addEventListener('click', this.boundClick)
    this.canvas.addEventListener('touchend', this.boundTouch, { passive: true })
    document.addEventListener('keydown', this.boundKeyDown)
  }

  pause(): void {
    this.running = false
    if (this.animFrameId !== null) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null }
  }

  resume(): void {
    if (!this.running) {
      this.running = true; this.lastTime = performance.now()
      this.nextSpawnTime = performance.now()
      this.loop(performance.now())
    }
  }

  destroy(): void {
    this.pause()
    this.canvas.removeEventListener('click', this.boundClick)
    this.canvas.removeEventListener('touchend', this.boundTouch)
    document.removeEventListener('keydown', this.boundKeyDown)
  }

  getScore(): number { return this.score }

  // ─── RAF-based Mole Spawner ───────────────────────────────────────────────

  private trySpawnMole(now: number): void {
    if (this.roundOver || now < this.nextSpawnTime) return

    const available = this.holes.map((h, i) => (!h.active && !h.hit ? i : -1)).filter(i => i >= 0)
    if (available.length > 0) {
      const idx = available[Math.floor(Math.random() * available.length)]!
      this.activateMole(idx, now)
    }

    // Spawn rate accelerates: 900ms → 500ms over the round
    const elapsed = now - this.roundStart
    const t = Math.min(1, elapsed / ROUND_DURATION)
    const interval = SPAWN_START_MS - t * (SPAWN_START_MS - SPAWN_END_MS)
    this.nextSpawnTime = now + interval
  }

  private activateMole(idx: number, now: number): void {
    const hole = this.holes[idx]!
    hole.active = true; hole.hit = false; hole.hitProgress = 0
    hole.hideAt = now + MOLE_MIN_STAY + Math.random() * MOLE_STAY_RANGE
  }

  private holeBounds(i: number): { cx: number; cy: number; r: number } {
    const cols = GRID; const rows = GRID
    const padX = 24; const padY = 24
    const cellW = (this.W - padX * 2) / cols; const cellH = (this.H - padY * 2 - 30) / rows
    const col = i % cols; const row = Math.floor(i / cols)
    const cx = padX + col * cellW + cellW / 2
    const cy = padY + row * cellH + cellH / 2 + 30
    const r = Math.min(cellW, cellH) * 0.38
    return { cx, cy, r }
  }

  // ─── Input ────────────────────────────────────────────────────────────────

  private onClick(e: MouseEvent): void { const r = this.canvas.getBoundingClientRect(); this.tryHit(e.clientX - r.left, e.clientY - r.top) }
  private onTouch(e: TouchEvent): void { const t = e.changedTouches[0]; if (!t) return; const r = this.canvas.getBoundingClientRect(); this.tryHit(t.clientX - r.left, t.clientY - r.top) }

  private onKeyDown(e: KeyboardEvent): void {
    // Keys 1-9 map to holes 0-8 (top-left to bottom-right)
    const num = parseInt(e.key, 10)
    if (num >= 1 && num <= 9) {
      e.preventDefault()
      if (this.roundOver) { this.reset(); this.nextSpawnTime = performance.now(); return }
      const idx = num - 1
      const hole = this.holes[idx]
      if (hole && hole.active && !hole.hit) {
        hole.active = false; hole.hit = true; hole.hitProgress = 0; hole.hideAt = 0
        this.score++; this.onScore?.(this.score)
      }
    }
  }

  private tryHit(px: number, py: number): void {
    if (this.roundOver) { this.reset(); this.nextSpawnTime = performance.now(); return }
    for (let i = 0; i < this.holes.length; i++) {
      const hole = this.holes[i]!; if (!hole.active || hole.hit) continue
      const b = this.holeBounds(i)
      const dist = Math.hypot(px - b.cx, py - b.cy)
      if (dist < b.r * 1.2) {
        hole.active = false; hole.hit = true; hole.hitProgress = 0; hole.hideAt = 0
        this.score++; this.onScore?.(this.score)
        return
      }
    }
  }

  // ─── Loop ─────────────────────────────────────────────────────────────────

  private loop(now: number): void {
    if (!this.running) return
    this.animFrameId = requestAnimationFrame(t => this.loop(t))
    const dt = now - this.lastTime; this.lastTime = now
    this.update(now, dt); this.render()
  }

  private update(now: number, dt: number): void {
    if (this.roundOver) return

    this.timeLeft = Math.max(0, ROUND_DURATION - (now - this.roundStart))
    if (this.timeLeft === 0) { this.roundOver = true; this.onGameOver?.(); return }

    // RAF-based spawner (replaces setInterval)
    this.trySpawnMole(now)

    // Auto-hide moles whose time is up
    for (const hole of this.holes) {
      if (hole.active && hole.hideAt > 0 && now >= hole.hideAt) {
        hole.active = false; hole.hideAt = 0
      }
    }

    const step = dt / 200
    for (const hole of this.holes) {
      if (hole.active) hole.showProgress = Math.min(1, hole.showProgress + step)
      else if (hole.hit) { hole.hitProgress = Math.min(1, hole.hitProgress + step); if (hole.hitProgress >= 1) hole.hit = false }
      else hole.showProgress = Math.max(0, hole.showProgress - step)
    }
  }

  private render(): void {
    const { ctx, W, H, theme } = this
    ctx.fillStyle = theme.background; ctx.fillRect(0, 0, W, H)

    // Timer bar
    const progress = this.timeLeft / ROUND_DURATION
    ctx.fillStyle = theme.surface; ctx.fillRect(16, 10, W - 32, 12)
    ctx.fillStyle = progress > 0.3 ? theme.primary : theme.accent
    ctx.beginPath(); ctx.roundRect(16, 10, (W - 32) * progress, 12, 4); ctx.fill()

    // Score
    ctx.fillStyle = theme.text; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'left'
    ctx.fillText(`${this.score}`, 16, H - 8)
    ctx.textAlign = 'right'; ctx.globalAlpha = 0.5; ctx.font = '12px system-ui'
    ctx.fillText(`${Math.ceil(this.timeLeft / 1000)}s`, W - 16, H - 8); ctx.globalAlpha = 1

    // Holes & moles
    for (let i = 0; i < this.holes.length; i++) {
      const hole = this.holes[i]!; const b = this.holeBounds(i)

      // Hole (always visible)
      ctx.fillStyle = theme.surface; ctx.globalAlpha = 0.6
      ctx.beginPath(); ctx.ellipse(b.cx, b.cy + b.r * 0.2, b.r, b.r * 0.4, 0, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1

      // Hole number label for keyboard hint
      ctx.fillStyle = theme.text; ctx.globalAlpha = 0.2; ctx.font = `bold ${b.r * 0.3}px monospace`
      ctx.textAlign = 'center'; ctx.fillText(`${i + 1}`, b.cx, b.cy + b.r * 0.55); ctx.globalAlpha = 1

      // Mole (pops up via showProgress or flies away on hit)
      const prog = hole.active || hole.hit ? (hole.hit ? 1 - hole.hitProgress : hole.showProgress) : hole.showProgress
      if (prog <= 0) continue

      const offsetY = (1 - prog) * b.r * 1.5
      const cy = b.cy - offsetY

      ctx.save()
      ctx.beginPath()
      ctx.ellipse(b.cx, b.cy + b.r * 0.25, b.r, b.r * 0.45, 0, 0, Math.PI * 2)
      ctx.clip()

      // Mole body
      ctx.fillStyle = hole.hit ? theme.accent : '#8B4513'
      ctx.beginPath(); ctx.arc(b.cx, cy, b.r * 0.8, 0, Math.PI * 2); ctx.fill()
      // Eyes
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(b.cx - b.r * 0.28, cy - b.r * 0.15, b.r * 0.15, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(b.cx + b.r * 0.28, cy - b.r * 0.15, b.r * 0.15, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#333'
      ctx.beginPath(); ctx.arc(b.cx - b.r * 0.25, cy - b.r * 0.15, b.r * 0.08, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(b.cx + b.r * 0.25, cy - b.r * 0.15, b.r * 0.08, 0, Math.PI * 2); ctx.fill()
      // Nose
      ctx.fillStyle = '#FFB6C1'
      ctx.beginPath(); ctx.arc(b.cx, cy + b.r * 0.05, b.r * 0.1, 0, Math.PI * 2); ctx.fill()

      if (hole.hit) {
        ctx.fillStyle = '#FFD700'; ctx.font = `bold ${b.r * 0.6}px system-ui`
        ctx.textAlign = 'center'; ctx.fillText('\u2713', b.cx, cy - b.r * 0.6)
      }

      ctx.restore()
    }

    // Round over overlay
    if (this.roundOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = theme.text; ctx.font = 'bold 24px system-ui'; ctx.textAlign = 'center'
      ctx.fillText(`Score: ${this.score}`, W / 2, H / 2)
      ctx.font = '14px system-ui'; ctx.globalAlpha = 0.7
      ctx.fillText('Tap to play again', W / 2, H / 2 + 32); ctx.globalAlpha = 1
    }
  }
}
