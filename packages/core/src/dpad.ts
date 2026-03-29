/**
 * Virtual D-pad — Reusable touch controller overlay.
 *
 * Renders 4 directional arrows (+ optional center/fire button) as an
 * overlay positioned at the bottom-center of a parent element.
 * Only renders when touch is available ('ontouchstart' in window).
 *
 * Each button meets the 44×44px minimum touch target requirement.
 * Semi-transparent, themed with the provided primary color.
 */

export type DpadDirection = 'up' | 'down' | 'left' | 'right'

export interface DpadOptions {
  /** Parent element to attach the overlay to. Must have position: relative/absolute/fixed. */
  parent: HTMLElement
  /** Primary theme color for button backgrounds. */
  primaryColor: string
  /** Text/icon color. */
  textColor: string
  /** Called when a direction button is pressed. */
  onDirection: (dir: DpadDirection) => void
  /** If true, render a center "fire" button. */
  showFire?: boolean
  /** Called when the fire button is pressed. */
  onFire?: () => void
}

const BTN_SIZE = 44
const GAP = 2

const ARROWS: Record<DpadDirection, string> = {
  up: '\u25B2',
  down: '\u25BC',
  left: '\u25C0',
  right: '\u25B6',
}

export class Dpad {
  private overlay: HTMLDivElement | null = null
  private boundClick: (e: MouseEvent) => void
  private boundTouch: (e: TouchEvent) => void

  constructor(private options: DpadOptions) {
    this.boundClick = this.handleClick.bind(this)
    this.boundTouch = this.handleTouch.bind(this)
  }

  /** Create and mount the D-pad. No-op if touch is unavailable. */
  mount(): void {
    if (!('ontouchstart' in window)) return
    if (this.overlay) return

    const { parent, primaryColor, textColor, showFire } = this.options

    // Ensure parent is positioned
    const pStyle = getComputedStyle(parent)
    if (pStyle.position === 'static') parent.style.position = 'relative'

    const overlay = document.createElement('div')
    overlay.setAttribute('data-lg-dpad', '')
    overlay.style.cssText = [
      'position:absolute',
      'bottom:12px',
      'left:50%',
      'transform:translateX(-50%)',
      `display:grid`,
      `grid-template-columns:${BTN_SIZE}px ${BTN_SIZE}px ${BTN_SIZE}px`,
      `grid-template-rows:${BTN_SIZE}px ${BTN_SIZE}px ${BTN_SIZE}px`,
      `gap:${GAP}px`,
      'pointer-events:none',
      'z-index:10',
    ].join(';')

    // Grid layout: [_, up, _], [left, center, right], [_, down, _]
    const cells: (DpadDirection | 'fire' | null)[] = [
      null, 'up', null,
      'left', showFire ? 'fire' : null, 'right',
      null, 'down', null,
    ]

    for (const cell of cells) {
      const btn = document.createElement('button')
      if (cell && cell !== 'fire') {
        btn.textContent = ARROWS[cell]
        btn.setAttribute('aria-label', cell)
        btn.dataset.dir = cell
        btn.style.cssText = this.buttonStyle(primaryColor, textColor)
      } else if (cell === 'fire') {
        btn.textContent = '\u25CF'
        btn.setAttribute('aria-label', 'fire')
        btn.dataset.action = 'fire'
        btn.style.cssText = this.buttonStyle(primaryColor, textColor)
      } else {
        btn.style.cssText = 'visibility:hidden;'
      }
      overlay.appendChild(btn)
    }

    overlay.addEventListener('click', this.boundClick)
    overlay.addEventListener('touchstart', this.boundTouch, { passive: true })

    parent.appendChild(overlay)
    this.overlay = overlay
  }

  /** Remove the D-pad from the DOM and clean up listeners. */
  destroy(): void {
    if (!this.overlay) return
    this.overlay.removeEventListener('click', this.boundClick)
    this.overlay.removeEventListener('touchstart', this.boundTouch)
    this.overlay.remove()
    this.overlay = null
  }

  private buttonStyle(bg: string, text: string): string {
    return [
      'pointer-events:auto',
      `width:${BTN_SIZE}px`,
      `height:${BTN_SIZE}px`,
      'border:none',
      'border-radius:8px',
      `background:${bg}55`,
      `color:${text}`,
      'font-size:16px',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'touch-action:manipulation',
      'cursor:pointer',
      '-webkit-tap-highlight-color:transparent',
    ].join(';')
  }

  private handleClick(e: MouseEvent): void {
    const target = (e.target as HTMLElement).closest('[data-dir],[data-action]') as HTMLElement | null
    if (!target) return
    if (target.dataset.dir) {
      this.options.onDirection(target.dataset.dir as DpadDirection)
    } else if (target.dataset.action === 'fire') {
      this.options.onFire?.()
    }
  }

  private handleTouch(e: TouchEvent): void {
    const target = (e.target as HTMLElement).closest('[data-dir],[data-action]') as HTMLElement | null
    if (!target) return
    if (target.dataset.dir) {
      this.options.onDirection(target.dataset.dir as DpadDirection)
    } else if (target.dataset.action === 'fire') {
      this.options.onFire?.()
    }
  }
}
