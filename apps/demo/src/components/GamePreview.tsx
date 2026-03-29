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
    import('loading-games')
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (theme) {
      (el as HTMLElement & { theme: Record<string, string> }).theme = theme
    }
  }, [theme])

  return (
    <loading-game
      ref={ref as React.Ref<HTMLElement>}
      game={game}
      active={active ? 'true' : undefined}
      size={size}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

declare global {
  interface IntrinsicElements {
    'loading-game': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      game?: string
      active?: string
      size?: string
    }
  }
}
