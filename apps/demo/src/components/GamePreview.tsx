import { useEffect, useRef } from 'react'

interface Props {
  game?: string
  active?: boolean
  theme?: Record<string, string>
  size?: string
}

export default function GamePreview({ game = 'snake', active = true, theme, size = 'md' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    let cancelled = false
    import('loading-games').then(() => {
      if (cancelled) return
      const el = ref.current as (HTMLElement & { theme?: Record<string, string> }) | null
      if (!el) return
      // Apply theme BEFORE activating so the game starts with the right colours
      if (theme) el.theme = theme
      if (active) el.setAttribute('active', 'true')
    })
    return () => { cancelled = true }
  }, []) // Intentionally mount-only — parent drives remounts via key

  return (
    <loading-game
      ref={ref as React.Ref<HTMLElement>}
      game={game}
      size={size}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'loading-game': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        game?: string
        active?: string
        size?: string
      }
    }
  }
}
