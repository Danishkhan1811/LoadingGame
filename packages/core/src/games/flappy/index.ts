/**
 * Flappy Bird — Infinite runner, physics-based.
 *
 * Mechanics:
 * - Gravity: 0.4 px/frame², jump impulse: -7 px/frame
 * - Gap: 150px, randomized vertical position
 * - Score: +1 per pipe cleared
 * - Pipe color: theme.primary
 *
 * Controls:
 * - Desktop: Spacebar or click
 * - Mobile: Tap
 *
 * Bundle target: ~5 kB gzipped
 */

import type { GamePlugin, ThemeObject, ResolvedTheme } from '../../types.js'
import { resolveTheme } from '../../theme.js'

const GRAVITY = 0.4
const JUMP_VELOCITY = -7
const PIPE_WIDTH = 52
const PIPE_GAP = 150
const PIPE_SPEED = 2.2
const BIRD_X = 80
const BIRD_RADIUS = 14

interface Pipe {
  x: number
  topHeight: number
  passed: boolean
}

export class FlappyGame implements GamePlugin {
  readonly name = 'flappy'
  readonly bundleSize = 5_000

  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private theme!: ResolvedTheme
  private W = 0
  private H = 0

  private birdY = 0
  private birdVY = 0
  private pipes: Pipe[] = []
  private score = 0
  private personalBest = 0
  private animFrameId: number | null = null
  private running = false
  private dead = false
  private frameCount = 0
  private lastTime = 0

  private boundJump: () => void
  private boundKey: (e: KeyboardEvent) => void
  private boundTouch: () => void

  constructor(private onScore?: (score: number) => void) {
    this.boundJump = this.jump.bind(this)
    this.boundKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); this.jump() } }
    this.boundTouch = this.jump.bind(this)
  }

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
    this.W = rect.width
    this.H = rect.height

    canvas.setAttribute('aria-label', 'Flappy Bird game \u2014 loading in background')
    canvas.setAttribute('role', 'img')

    this.reset()
  }

  private reset(): void {
    this.birdY = this.H / 2
    this.birdVY = 0
    this.pipes = []
    this.score = 0
    this.dead = false
    this.frameCount = 0
    this.spawnPipe(this.W + 100)
  }

  private spawnPipe(x?: number): void {
    const minTop = 60
    const maxTop = this.H - PIPE_GAP - 60
    const topHeight = minTop + Math.random() * (maxTop - minTop)
    this.pipes.push({ x: x ?? this.W + 50, topHeight, passed: false })
  }

  start(): void {
    this.running = true
    this.lastTime = performance.now()
    this.loop(performance.now())
    this.canvas.addEventListener('click', this.boundJump)
    document.addEventListener('keydown', this.boundKey)
    this.canvas.addEventListener('touchstart', this.boundTouch, { passive: true })
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
      this.lastTime = performance.now()
      this.loop(performance.now())
    }
  }

  destroy(): void {
    this.pause()
    this.canvas.removeEventListener('click', this.boundJump)
    document.removeEventListener('keydown', this.boundKey)
    this.canvas.removeEventListener('touchstart', this.boundTouch)
  }

  getScore(): number { return this.score }

  private jump(): void {
    if (this.dead) { this.reset(); return }
    this.birdVY = JUMP_VELOCITY
  }

  private loop(now: number): void {
    if (!this.running) return
    this.animFrameId = requestAnimationFrame(t => this.loop(t))
    const dt = Math.min((now - this.lastTime) / 16.67, 3)
    this.lastTime = now
    if (!this.dead) this.update(dt)
    this.render()
  }

  private update(dt: number): void {
    this.frameCount++
    this.birdVY += GRAVITY * dt
    this.birdY += this.birdVY * dt

    if (this.birdY + BIRD_RADIUS >= this.H || this.birdY - BIRD_RADIUS <= 0) {
      this.die(); return
    }

    if (this.frameCount % 90 === 0) this.spawnPipe()

    for (const pipe of this.pipes) {
      pipe.x -= PIPE_SPEED * dt
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
        pipe.passed = true
        this.score++
        if (this.score > this.personalBest) this.personalBest = this.score
        this.onScore?.(this.score)
      }

      const inX = BIRD_X + BIRD_RADIUS > pipe.x && BIRD_X - BIRD_RADIUS < pipe.x + PIPE_WIDTH
      const inY = this.birdY - BIRD_RADIUS < pipe.topHeight || this.birdY + BIRD_RADIUS > pipe.topHeight + PIPE_GAP
      if (inX && inY) { this.die(); return }
    }
    this.pipes = this.pipes.filter(p => p.x + PIPE_WIDTH > -10)
  }

  private die(): void {
    this.dead = true
    this.birdVY = JUMP_VELOCITY * 0.5
  }

  private render(): void {
    const { ctx, W, H, theme } = this
    ctx.fillStyle = theme.background
    ctx.fillRect(0, 0, W, H)

    for (const pipe of this.pipes) {
      ctx.fillStyle = theme.primary
      ctx.fillRect(pipe.x - 4, pipe.topHeight - 24, PIPE_WIDTH + 8, 24)
      ctx.beginPath(); ctx.roundRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight - 6, [0,0,6,6]); ctx.fill()
      const bY = pipe.topHeight + PIPE_GAP
      ctx.fillRect(pipe.x - 4, bY, PIPE_WIDTH + 8, 24)
      ctx.beginPath(); ctx.roundRect(pipe.x, bY + 6, PIPE_WIDTH, H - bY, [6,6,0,0]); ctx.fill()
    }

    ctx.save()
    ctx.translate(BIRD_X, this.birdY)
    ctx.rotate(Math.min(Math.max(this.birdVY * 0.05, -0.5), 1.0))
    if (this.dead) ctx.globalAlpha = 0.6
    ctx.fillStyle = '#FFD93D'
    ctx.beginPath(); ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(5, -4, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(6, -4, 2.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#FF6B35'
    ctx.beginPath(); ctx.moveTo(BIRD_RADIUS - 2, 0); ctx.lineTo(BIRD_RADIUS + 8, -3); ctx.lineTo(BIRD_RADIUS + 8, 3); ctx.closePath(); ctx.fill()
    ctx.restore()

    ctx.fillStyle = theme.text
    ctx.font = 'bold 28px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(String(this.score), W / 2, 44)

    if (this.dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = theme.text
      ctx.font = 'bold 20px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Tap to retry', W / 2, H / 2)
      ctx.font = '14px system-ui'; ctx.globalAlpha = 0.7
      ctx.fillText(`Score: ${this.score}  Best: ${this.personalBest}`, W / 2, H / 2 + 28)
      ctx.globalAlpha = 1
    }
  }
}
