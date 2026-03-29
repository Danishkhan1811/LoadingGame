import { useState, useCallback } from 'react'
import GamePreview from './GamePreview'

const GAMES = ['snake', 'flappy', 'memory-cards', 'whack-a-mole', 'brick-breaker', '2048', 'wordle-lite', 'asteroids'] as const
const SIZES = ['sm', 'md', 'lg', 'full'] as const

const DEFAULT_THEME = {
  primary: '#6366F1',
  background: '#0F0F0F',
  surface: '#1A1A2E',
  text: '#FFFFFF',
  accent: '#E94560',
}

export default function ThemeConfigurator() {
  const [game, setGame] = useState<string>('snake')
  const [size, setSize] = useState<string>('md')
  const [theme, setTheme] = useState({ ...DEFAULT_THEME })

  const updateColor = useCallback((key: string, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
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
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left: Live Preview */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Live Preview</h3>
        <div className="relative bg-gray-900 rounded-xl border border-gray-800 overflow-hidden" style={{ height: 360 }}>
          <GamePreview game={game} active={true} theme={theme} size="full" />
        </div>
      </div>

      {/* Right: Controls */}
      <div className="space-y-6">
        {/* Game Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Game</label>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
          >
            {GAMES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Size Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Size</label>
          <div className="flex gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  s === size ? 'bg-brand-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Color Pickers */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Theme Colors</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(theme).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="w-8 h-8 rounded border border-gray-700 cursor-pointer bg-transparent"
                />
                {key}
              </label>
            ))}
          </div>
        </div>

        {/* Code Snippet */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-400">Generated Code</label>
            <button
              onClick={copySnippet}
              className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre className="code-block text-xs text-gray-300">
            <code>{snippet}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
