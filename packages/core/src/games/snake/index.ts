/**
 * Snake — Classic snake game with wrapping walls.
 * 
 * Controls:
 * - Keyboard: Arrow keys
 * - Touch: Swipe gestures
 * - Mobile: Virtual D-pad (rendered by the host component)
 * 
 * Bundle target: ~4 kB gzipped
 */

import type { GamePlugin, ThemeObject, ResolvedTheme } from '../../types.js'
import { resolveTheme } from '../../theme.js'

type Direction = 'up' | 'down' | 'left' | 'right'
type Point = { x: number; y: number }

const GRID_SIZE = 20       // cells per row/column
const BASE_TICK_MS = 150   // starting tick speed
const SPEED_INCREASE = 5   // ms faster per 5 points
const DPAD_SIZE = 44       // min touch target size per spec
const DPAD_PAD = 12        // padding from canvas edge
const SWIPE_THRESHOLD = 30 // minimum swipe distance (px)

export class SnakeGame implements GamePlugin {
  readonly name = 'snake'
  readonly bundleSize = 4_000

  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private theme!: ResolvedTheme

  private snake: Point[] = []
  private food: Point = { x: 0, y: 0 }
  private direction: Direction = 'right'
  private nextDirection: Direction = 'right'
  private score = 0
  private tickMs = BASE_TICK_MS
  private lastTick = 0
  private animFrameId: number | null = null
  private running = false
  private cellSize = 0

  private boundKeyDown: (e: KeyboardEvent) => void
  private boundTouchStart: (e: TouchEvent) => void
  private boundTouchEnd: (e: TouchEvent) => void
  private boundDpadClick: (e: MouseEvent) => void
  private boundDpadTouch: (e: TouchEvent) => void
  private touchStartX = 0
  private touchStartY = 0
  private isTouchDevice = false
  private dpadOverlay: HTMLElement | null = null

  private onScoreCallback?: (score: number) => void

  constructor(onScore?: (score: number) => void) {
    this.onScoreCallback = onScore
    this.boundKeyDown = this.handleKeyDown.bind(this)
    this.boundTouchStart = this.handleTouchStart.bind(this)
    this.boundTouchEnd = this.handleTouchEnd.bind(this)
    this.boundDpadClick = this.handleDpadClick.bind(this)
    this.boundDpadTouch = this.handleDpadTouch.bind(this)
  }

  init(canvas: HTMLCanvasElement, theme: ThemeObject): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.theme = resolveTheme(theme)

    canvas.setAttribute('aria-label', 'Snake game \u2014 loading in background')
    canvas.setAttribute('role', 'img')

    // Scale for device pixel ratio
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    this.cellSize = Math.floor(rect.width / GRID_SIZE)
    this.isTouchDevice = 'ontouchstart' in window
    this.reset()
  }

  private reset(): void {
    // Start in the middle going right
    const mid = Math.floor(GRID_SIZE / 2)
    this.snake = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ]
    this.direction = 'right'
    this.nextDirection = 'right'
    this.score = 0
    this.tickMs = BASE_TICK_MS
    this.placeFood()
  }

  private placeFood(): void {
    const occupied = new Set(this.snake.map(p => `${p.x},${p.y}`))
    let pos: Point
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (occupied.has(`${pos.x},${pos.y}`))
    this.food = pos
  }

  start(): void {
    this.running = true
    this.lastTick = performance.now()
    this.loop(performance.now())
    this.attachEventListeners()
    if (this.isTouchDevice) this.createDpad()
  }

  pause(): void {
    this.running = false
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
  }

  resume(): void {
    if (!this.running) {
      this.running = true
      this.lastTick = performance.now()
      this.loop(performance.now())
    }
  }

  destroy(): void {
    this.pause()
    this.removeEventListeners()
    this.removeDpad()
  }

  getScore(): number {
    return this.score
  }

  // ─── Game Loop ──────────────────────────────────────────────────────────────

  private loop(now: number): void {
    if (!this.running) return

    this.animFrameId = requestAnimationFrame(t => this.loop(t))

    if (now - this.lastTick >= this.tickMs) {
      this.lastTick = now
      this.tick()
    }

    this.render()
  }

  private tick(): void {
    this.direction = this.nextDirection

    const head = this.snake[0]!
    const next: Point = {
      x: (head.x + (this.direction === 'right' ? 1 : this.direction === 'left' ? -1 : 0) + GRID_SIZE) % GRID_SIZE,
      y: (head.y + (this.direction === 'down' ? 1 : this.direction === 'up' ? -1 : 0) + GRID_SIZE) % GRID_SIZE,
    }

    // Collision with self
    if (this.snake.some(p => p.x === next.x && p.y === next.y)) {
      this.reset()
      return
    }

    this.snake.unshift(next)

    if (next.x === this.food.x && next.y === this.food.y) {
      this.score += 10
      this.onScoreCallback?.(this.score)

      // Speed up every 5 points
      if (this.score % 50 === 0) {
        this.tickMs = Math.max(60, this.tickMs - SPEED_INCREASE)
      }

      this.placeFood()
    } else {
      this.snake.pop()
    }
  }

  // ─── Rendering ──────────────────────────────────────────────────────────────

  private render(): void {
    const { ctx, cellSize, theme } = this
    const rect = this.canvas.getBoundingClientRect()
    const W = rect.width
    const H = rect.height

    // Background
    ctx.fillStyle = theme.background
    ctx.fillRect(0, 0, W, H)

    // Grid (subtle)
    ctx.strokeStyle = theme.surface
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.3
    for (let x = 0; x <= W; x += cellSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y <= H; y += cellSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Food
    const fx = this.food.x * cellSize + cellSize / 2
    const fy = this.food.y * cellSize + cellSize / 2
    ctx.fillStyle = theme.accent
    ctx.beginPath()
    ctx.arc(fx, fy, cellSize * 0.4, 0, Math.PI * 2)
    ctx.fill()

    // Snake
    this.snake.forEach((p, i) => {
      const x = p.x * cellSize
      const y = p.y * cellSize
      const padding = 1

      if (i === 0) {
        // Head
        ctx.fillStyle = theme.primary
      } else {
        // Body — fade toward tail
        const alpha = 1 - (i / this.snake.length) * 0.4
        ctx.globalAlpha = alpha
        ctx.fillStyle = theme.primary
      }

      const r = 3
      const px = x + padding
      const py = y + padding
      const pw = cellSize - padding * 2
      const ph = cellSize - padding * 2

      ctx.beginPath()
      ctx.roundRect(px, py, pw, ph, r)
      ctx.fill()
      ctx.globalAlpha = 1
    })

    // Score
    ctx.fillStyle = theme.text
    ctx.font = `bold ${Math.round(cellSize * 0.7)}px monospace`
    ctx.textAlign = 'right'
    ctx.fillText(`${this.score}`, W - 8, cellSize)
  }

  // ─── Controls ───────────────────────────────────────────────────────────────

  private attachEventListeners(): void {
    document.addEventListener('keydown', this.boundKeyDown)
    this.canvas.addEventListener('touchstart', this.boundTouchStart, { passive: true })
    this.canvas.addEventListener('touchend', this.boundTouchEnd, { passive: true })
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.boundKeyDown)
    this.canvas.removeEventListener('touchstart', this.boundTouchStart)
    this.canvas.removeEventListener('touchend', this.boundTouchEnd)
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const map: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    }
    const dir = map[e.key]
    if (!dir) return

    // Prevent reverse direction
    const opposites: Record<Direction, Direction> = {
      up: 'down', down: 'up', left: 'right', right: 'left',
    }
    if (opposites[dir] !== this.direction) {
      this.nextDirection = dir
      e.preventDefault()
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0]
    if (!touch) return
    this.touchStartX = touch.clientX
    this.touchStartY = touch.clientY
  }

  private handleTouchEnd(e: TouchEvent): void {
    const touch = e.changedTouches[0]
    if (!touch) return

    const dx = touch.clientX - this.touchStartX
    const dy = touch.clientY - this.touchStartY
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return // min 44px touch target

    let dir: Direction
    if (absDx > absDy) {
      dir = dx > 0 ? 'right' : 'left'
    } else {
      dir = dy > 0 ? 'down' : 'up'
    }

    const opposites: Record<Direction, Direction> = {
      up: 'down', down: 'up', left: 'right', right: 'left',
    }
    if (opposites[dir] !== this.direction) {
      this.nextDirection = dir
    }
  }

  // ─── Virtual D-pad ─────────────────────────────────────────────────────────

  private createDpad(): void {
    if (this.dpadOverlay) return
    const parent = this.canvas.parentElement
    if (!parent) return

    const overlay = document.createElement('div')
    overlay.style.cssText = `position:absolute;bottom:${DPAD_PAD}px;left:50%;transform:translateX(-50%);display:grid;grid-template-columns:${DPAD_SIZE}px ${DPAD_SIZE}px ${DPAD_SIZE}px;grid-template-rows:${DPAD_SIZE}px ${DPAD_SIZE}px ${DPAD_SIZE}px;gap:2px;pointer-events:none;z-index:10;`

    const dirs: (Direction | null)[] = [
      null, 'up', null,
      'left', null, 'right',
      null, 'down', null,
    ]
    const arrows: Record<string, string> = { up: '\u25B2', down: '\u25BC', left: '\u25C0', right: '\u25B6' }

    for (const dir of dirs) {
      const btn = document.createElement('button')
      if (dir) {
        btn.textContent = arrows[dir]!
        btn.setAttribute('aria-label', dir)
        btn.dataset.dir = dir
        btn.style.cssText = `pointer-events:auto;width:${DPAD_SIZE}px;height:${DPAD_SIZE}px;border:none;border-radius:8px;background:${this.theme.primary}55;color:${this.theme.text};font-size:16px;display:flex;align-items:center;justify-content:center;touch-action:manipulation;cursor:pointer;-webkit-tap-highlight-color:transparent;`
      } else {
        btn.style.cssText = 'visibility:hidden;'
      }
      overlay.appendChild(btn)
    }

    // Ensure parent is positioned for absolute child
    const pStyle = getComputedStyle(parent)
    if (pStyle.position === 'static') parent.style.position = 'relative'

    parent.appendChild(overlay)
    this.dpadOverlay = overlay

    overlay.addEventListener('click', this.boundDpadClick)
    overlay.addEventListener('touchstart', this.boundDpadTouch, { passive: true })
  }

  private removeDpad(): void {
    if (this.dpadOverlay) {
      this.dpadOverlay.removeEventListener('click', this.boundDpadClick)
      this.dpadOverlay.removeEventListener('touchstart', this.boundDpadTouch)
      this.dpadOverlay.remove()
      this.dpadOverlay = null
    }
  }

  private handleDpadInput(dir: Direction): void {
    const opposites: Record<Direction, Direction> = {
      up: 'down', down: 'up', left: 'right', right: 'left',
    }
    if (opposites[dir] !== this.direction) {
      this.nextDirection = dir
    }
  }

  private handleDpadClick(e: MouseEvent): void {
    const btn = (e.target as HTMLElement).closest('[data-dir]') as HTMLElement | null
    if (btn?.dataset.dir) this.handleDpadInput(btn.dataset.dir as Direction)
  }

  private handleDpadTouch(e: TouchEvent): void {
    const btn = (e.target as HTMLElement).closest('[data-dir]') as HTMLElement | null
    if (btn?.dataset.dir) this.handleDpadInput(btn.dataset.dir as Direction)
  }
}
