/**
 * Tests for core utilities: scores, delay, theme resolution
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPersonalBest, saveScore, clearScores } from '../src/scores.js'
import { DelayController } from '../src/delay.js'
import { resolveTheme } from '../src/theme.js'

// ─── Scores ────────────────────────────────────────────────────────────────────

describe('scores', () => {
  beforeEach(() => clearScores())
  afterEach(() => clearScores())

  it('returns 0 for unknown game', () => {
    expect(getPersonalBest('snake')).toBe(0)
  })

  it('saves and retrieves a score', () => {
    saveScore('snake', 100)
    expect(getPersonalBest('snake')).toBe(100)
  })

  it('returns true for new record', () => {
    const isNew = saveScore('snake', 100)
    expect(isNew).toBe(true)
  })

  it('returns false when not a new record', () => {
    saveScore('snake', 100)
    const isNew = saveScore('snake', 50)
    expect(isNew).toBe(false)
  })

  it('keeps personal best on lower score', () => {
    saveScore('snake', 100)
    saveScore('snake', 50)
    expect(getPersonalBest('snake')).toBe(100)
  })

  it('updates personal best on higher score', () => {
    saveScore('snake', 100)
    saveScore('snake', 200)
    expect(getPersonalBest('snake')).toBe(200)
  })

  it('scopes scores by namespace', () => {
    saveScore('snake', 100, 'app1')
    saveScore('snake', 200, 'app2')
    expect(getPersonalBest('snake', 'app1')).toBe(100)
    expect(getPersonalBest('snake', 'app2')).toBe(200)
  })

  it('clears scores by namespace without touching others', () => {
    saveScore('snake', 100, 'app1')
    saveScore('snake', 200, 'app2')
    clearScores('app1')
    expect(getPersonalBest('snake', 'app1')).toBe(0)
    expect(getPersonalBest('snake', 'app2')).toBe(200)
  })
})

// ─── Delay Controller ──────────────────────────────────────────────────────────

describe('DelayController', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('calls onShow after delay', () => {
    const onShow = vi.fn()
    const onExit = vi.fn()
    const ctrl = new DelayController({ delay: 800, minDisplay: 0, onShow, onExit })
    ctrl.start()
    vi.advanceTimersByTime(799)
    expect(onShow).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onShow).toHaveBeenCalledOnce()
    ctrl.destroy()
  })

  it('does NOT call onShow if loading ends before delay', () => {
    const onShow = vi.fn()
    const onExit = vi.fn()
    const ctrl = new DelayController({ delay: 800, minDisplay: 0, onShow, onExit })
    ctrl.start()
    vi.advanceTimersByTime(400) // loading completes at 400ms
    ctrl.end()
    vi.advanceTimersByTime(800) // delay would have fired here
    expect(onShow).not.toHaveBeenCalled()
    ctrl.destroy()
  })

  it('calls onExit after minDisplay', () => {
    const onShow = vi.fn()
    const onExit = vi.fn()
    const ctrl = new DelayController({ delay: 800, minDisplay: 1000, onShow, onExit })
    ctrl.start()
    vi.advanceTimersByTime(800) // game shows
    ctrl.end()                  // loading done
    vi.advanceTimersByTime(999)
    expect(onExit).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onExit).toHaveBeenCalledOnce()
    ctrl.destroy()
  })

  it('calls onExit immediately if minDisplay already elapsed', () => {
    const onShow = vi.fn()
    const onExit = vi.fn()
    const ctrl = new DelayController({ delay: 800, minDisplay: 500, onShow, onExit })
    ctrl.start()
    vi.advanceTimersByTime(800)  // game shows
    vi.advanceTimersByTime(600)  // minDisplay elapses
    ctrl.end()
    expect(onExit).toHaveBeenCalledOnce()
    ctrl.destroy()
  })
})

// ─── Theme Resolution ──────────────────────────────────────────────────────────

describe('resolveTheme', () => {
  it('returns dark defaults when no input', () => {
    const theme = resolveTheme()
    expect(theme.primary).toBeDefined()
    expect(theme.background).toBeDefined()
    expect(theme.text).toBeDefined()
  })

  it('applies explicit theme overrides', () => {
    const theme = resolveTheme({ primary: '#FF0000' })
    expect(theme.primary).toBe('#FF0000')
  })

  it('does not mutate the input object', () => {
    const input = { primary: '#FF0000' }
    resolveTheme(input)
    expect(Object.keys(input)).toHaveLength(1)
  })

  it('fills in missing fields from defaults', () => {
    const theme = resolveTheme({ primary: '#FF0000' })
    expect(theme.background).toBeDefined()
    expect(theme.text).toBeDefined()
    expect(theme.surface).toBeDefined()
  })
})
