import { useState, useEffect, useRef } from 'react'

interface Game {
  name: string
  emoji: string
  description: string
  controls: string
  bundle: string
  color: string
}

const games: Game[] = [
  { name: 'snake',        emoji: '🐍', description: 'Classic snake — eat, grow, survive.',  controls: 'Arrow keys / swipe / D-pad',    bundle: '2.8 kB', color: '#39d353' },
  { name: 'flappy',       emoji: '🐦', description: 'Dodge endless pipes one tap at a time.', controls: 'Spacebar / tap',               bundle: '1.9 kB', color: '#2f81f7' },
  { name: 'memory-cards', emoji: '🃏', description: 'Flip and match all pairs to win.',       controls: 'Mouse / tap / keyboard',       bundle: '2.4 kB', color: '#bc8cff' },
  { name: 'whack-a-mole', emoji: '🔨', description: 'Bonk every mole in 20 seconds.',         controls: 'Click / tap / keys 1–9',       bundle: '2.4 kB', color: '#f78166' },
]

function LoadingGameEl({ game, active }: { game: string; active: boolean }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    import('loading-games')
  }, [])

  useEffect(() => {
    const el = ref.current as HTMLElement & { theme?: Record<string, string> } | null
    if (!el) return
    el.theme = { primary: '#2f81f7', background: '#0d1117', surface: '#161b22', text: '#e6edf3', accent: '#bc8cff' }
  }, [])

  return (
    <loading-game
      ref={ref as React.Ref<HTMLElement>}
      game={game}
      active={active ? 'true' : undefined}
      size="md"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

export default function GamesGrid() {
  const [activeGame, setActiveGame] = useState<Game | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveGame(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = activeGame ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeGame])

  return (
    <>
      {/* ── Game Cards Grid ── */}
      <div className="grid md:grid-cols-2 gap-5">
        {games.map((g) => (
          <button
            key={g.name}
            onClick={() => setActiveGame(g)}
            className="card-hover text-left group"
            style={{ padding: 0, cursor: 'pointer', border: 'none', background: 'none', width: '100%' }}
          >
            {/* Colour accent top stripe */}
            <div style={{ height: 3, background: g.color, borderRadius: '12px 12px 0 0' }} />

            <div style={{ padding: '20px 24px 24px' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 36 }}>{g.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: 20, color: '#e6edf3', textTransform: 'capitalize' }}>{g.name}</span>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: g.color, background: g.color + '18', border: `1px solid ${g.color}30`, padding: '3px 10px', borderRadius: 20 }}>
                  {g.bundle}
                </span>
              </div>

              <p style={{ fontSize: 14, color: '#8b949e', marginBottom: 16 }}>{g.description}</p>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 12, color: '#8b949e' }}>⌨ {g.controls}</span>
                <span style={{ fontSize: 13, color: g.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  ▶ Play
                </span>
              </div>

              {/* Live badge */}
              <div className="flex items-center gap-1.5 mt-4">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#39d353', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 11, color: '#39d353', fontWeight: 600 }}>Live &amp; Playable</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Modal ── */}
      {activeGame && (
        <div
          className="modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveGame(null) }}
        >
          <div className="modal-panel" style={{ maxWidth: 560 }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#161b22', borderBottom: '1px solid #30363d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{activeGame.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: 17, color: '#e6edf3', textTransform: 'capitalize' }}>{activeGame.name}</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: activeGame.color, background: activeGame.color + '18', border: `1px solid ${activeGame.color}30`, padding: '2px 8px', borderRadius: 20 }}>
                  {activeGame.bundle}
                </span>
              </div>
              <button
                onClick={() => setActiveGame(null)}
                style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '2px 6px', borderRadius: 6, transition: 'all 0.15s' }}
                onMouseOver={(e) => { (e.target as HTMLElement).style.background = '#21262d'; (e.target as HTMLElement).style.color = '#e6edf3' }}
                onMouseOut={(e) => { (e.target as HTMLElement).style.background = 'none'; (e.target as HTMLElement).style.color = '#8b949e' }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Game canvas */}
            <div style={{ height: 420, background: '#0d1117', position: 'relative' }}>
              <LoadingGameEl game={activeGame.name} active={true} />
            </div>

            {/* Controls hint */}
            <div style={{ padding: '12px 20px', background: '#161b22', borderTop: '1px solid #30363d', fontSize: 13, color: '#8b949e', textAlign: 'center' }}>
              ⌨ {activeGame.controls} &nbsp;·&nbsp; Press <kbd style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 4, padding: '1px 6px', fontSize: 11, color: '#e6edf3' }}>Esc</kbd> to close
            </div>
          </div>
        </div>
      )}
    </>
  )
}
