import { useState, useCallback, useRef, type CSSProperties } from 'react'
import GamePreview from './GamePreview'

const GAMES = ['snake', 'flappy', 'memory-cards', 'whack-a-mole'] as const
const SIZES = ['sm', 'md', 'lg'] as const

const DEFAULT_THEME = {
  primary: '#7b00ff',
  background: '#0A0A0F',
  surface: '#0F0F1A',
  text: '#FFFFFF',
  accent: '#9b30ff',
}

const label: CSSProperties = {
  display: 'block',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#6a6a8a',
  marginBottom: 8,
}

const controlSection: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

export default function ThemeConfigurator() {
  const [game, setGame] = useState<string>('snake')
  const [size, setSize] = useState<string>('md')
  const [theme, setTheme] = useState({ ...DEFAULT_THEME })
  const [previewKey, setPreviewKey] = useState(0)
  const themeTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleGameChange = useCallback((g: string) => {
    setGame(g)
    setPreviewKey((k) => k + 1)
  }, [])

  const handleSizeChange = useCallback((s: string) => {
    setSize(s)
    setPreviewKey((k) => k + 1)
  }, [])

  const updateColor = useCallback((key: string, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
    clearTimeout(themeTimerRef.current)
    themeTimerRef.current = setTimeout(() => setPreviewKey((k) => k + 1), 400)
  }, [])

  const snippet = `<LoadingGame
  game="${game}"
  active={isLoading}
  size="${size}"
  theme={{
    primary: '${theme.primary}',
    background: '${theme.background}',
    surface: '${theme.surface}',
    text: '${theme.text}',
    accent: '${theme.accent}',
  }}
/>`

  const [copied, setCopied] = useState(false)
  const copySnippet = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>

      {/* Left: Live Preview — contained, no overflow */}
      <div>
        <p style={label}>Live Preview</p>
        <div style={{
          position: 'relative',
          borderRadius: 14,
          border: '1px solid rgba(123,0,255,0.22)',
          overflow: 'hidden',
          height: 380,
          background: '#000',
          boxShadow: '0 0 40px rgba(123,0,255,0.1)',
        }}>
          {/* Scanline overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)',
            borderRadius: 'inherit',
          }} />
          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center,transparent 55%,rgba(98,0,234,0.3) 100%)',
            borderRadius: 'inherit',
          }} />
          {/* Game — contained with lg size, no "full" */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <GamePreview key={previewKey} game={game} active={true} theme={theme} size={size} />
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Game Selector */}
        <div style={controlSection}>
          <span style={label}>Game</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {GAMES.map((g) => (
              <button
                key={g}
                onClick={() => handleGameChange(g)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: g === game ? '1px solid rgba(123,0,255,0.55)' : '1px solid rgba(123,0,255,0.12)',
                  background: g === game ? 'rgba(123,0,255,0.2)' : 'rgba(123,0,255,0.04)',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: g === game ? '#e8b4ff' : '#6a6a8a',
                  transition: 'all 0.15s',
                  letterSpacing: '0.02em',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Size Selector */}
        <div style={controlSection}>
          <span style={label}>Preview Size</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => handleSizeChange(s)}
                style={{
                  padding: '5px 16px',
                  borderRadius: 8,
                  border: s === size ? '1px solid rgba(123,0,255,0.55)' : '1px solid rgba(123,0,255,0.12)',
                  background: s === size ? 'rgba(123,0,255,0.2)' : 'rgba(123,0,255,0.04)',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: s === size ? '#e8b4ff' : '#6a6a8a',
                  transition: 'all 0.15s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Color Pickers */}
        <div style={controlSection}>
          <span style={label}>Theme Colors</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(theme).map(([key, value]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div style={{
                  position: 'relative', width: 32, height: 32, borderRadius: 6,
                  border: '1px solid rgba(123,0,255,0.25)', overflow: 'hidden', flexShrink: 0,
                  boxShadow: `0 0 10px ${value}40`,
                }}>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateColor(key, e.target.value)}
                    style={{
                      position: 'absolute', inset: '-4px', width: 'calc(100% + 8px)',
                      height: 'calc(100% + 8px)', cursor: 'pointer', border: 'none', padding: 0,
                    }}
                  />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#B0B0C8' }}>{key}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Generated Code */}
        <div style={controlSection}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={label}>Generated Code</span>
            <button
              onClick={copySnippet}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 6,
                border: '1px solid rgba(123,0,255,0.25)',
                background: copied ? 'rgba(123,0,255,0.18)' : 'rgba(123,0,255,0.06)',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, color: copied ? '#e8b4ff' : '#6a6a8a',
                transition: 'all 0.15s',
                letterSpacing: '0.04em',
              }}
            >
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div style={{
            background: '#0D0D1F',
            border: '1px solid rgba(123,0,255,0.18)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <pre style={{
              padding: '16px 18px',
              margin: 0,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 12,
              lineHeight: 1.7,
              color: '#C8C8E8',
              overflowX: 'auto',
            }}>
              <code>{snippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
