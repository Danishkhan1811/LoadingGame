/**
 * Intelligent delay system.
 * 
 * Rules:
 * - Don't show the game if loading completes before `delay` ms (prevents flash)
 * - Once shown, keep the game visible for at least `minDisplay` ms
 * - When loading completes, transition to the exit animation
 */

export interface DelayOptions {
  /** Milliseconds to wait before showing the game. @default 800 */
  delay: number
  /** Minimum milliseconds to show the game once visible. @default 0 */
  minDisplay: number
  /** Called when the game should become visible */
  onShow: () => void
  /** Called when the game should start exiting */
  onExit: () => void
}

export class DelayController {
  private delayTimer: ReturnType<typeof setTimeout> | null = null
  private minDisplayTimer: ReturnType<typeof setTimeout> | null = null
  private showTime: number | null = null
  private loadingCompletedWhileDelaying = false
  private isVisible = false
  private destroyed = false

  constructor(private options: DelayOptions) {}

  /**
   * Called when loading starts (active = true).
   * Starts the delay timer.
   */
  start(): void {
    if (this.destroyed) return
    this.loadingCompletedWhileDelaying = false

    this.delayTimer = setTimeout(() => {
      this.delayTimer = null // timer has fired — clear the reference
      if (this.destroyed) return

      if (this.loadingCompletedWhileDelaying) {
        // Loading completed during delay — don't show game
        return
      }

      this.isVisible = true
      this.showTime = Date.now()
      this.options.onShow()
    }, this.options.delay)
  }

  /**
   * Called when loading ends (active = false).
   * Either cancels the delay (if still waiting) or triggers exit with minDisplay logic.
   */
  end(): void {
    if (this.destroyed) return

    if (this.delayTimer !== null) {
      // Still in delay period — cancel and never show
      clearTimeout(this.delayTimer)
      this.delayTimer = null
      this.loadingCompletedWhileDelaying = true
      return
    }

    if (!this.isVisible) return

    const elapsed = Date.now() - (this.showTime ?? 0)
    const remaining = this.options.minDisplay - elapsed

    if (remaining <= 0) {
      // minDisplay already elapsed — exit immediately
      this.triggerExit()
    } else {
      // Wait for minDisplay remainder
      this.minDisplayTimer = setTimeout(() => {
        if (!this.destroyed) this.triggerExit()
      }, remaining)
    }
  }

  private triggerExit(): void {
    this.isVisible = false
    this.options.onExit()
  }

  /** Clean up all timers. */
  destroy(): void {
    this.destroyed = true
    if (this.delayTimer !== null) {
      clearTimeout(this.delayTimer)
      this.delayTimer = null
    }
    if (this.minDisplayTimer !== null) {
      clearTimeout(this.minDisplayTimer)
      this.minDisplayTimer = null
    }
  }
}
