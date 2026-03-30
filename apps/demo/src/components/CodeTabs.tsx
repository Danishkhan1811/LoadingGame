import { useState } from 'react'

const tabs = [
  {
    label: 'React',
    slot: '01',
    code: [
      { type: 'keyword',  text: 'import' },
      { type: 'plain',    text: ' { ' },
      { type: 'fn',       text: 'LoadingGame' },
      { type: 'plain',    text: ' } ' },
      { type: 'keyword',  text: 'from' },
      { type: 'str',      text: " 'loading-games/react'" },
      { type: 'newline' },
      { type: 'newline' },
      { type: 'keyword',  text: 'function' },
      { type: 'plain',    text: ' ' },
      { type: 'fn',       text: 'App' },
      { type: 'plain',    text: '() {' },
      { type: 'newline' },
      { type: 'plain',    text: '  ' },
      { type: 'keyword',  text: 'const' },
      { type: 'plain',    text: ' [loading, setLoading] = ' },
      { type: 'fn',       text: 'useState' },
      { type: 'plain',    text: '(' },
      { type: 'bool',     text: 'true' },
      { type: 'plain',    text: ')' },
      { type: 'newline' },
      { type: 'newline' },
      { type: 'plain',    text: '  ' },
      { type: 'keyword',  text: 'return' },
      { type: 'plain',    text: ' (' },
      { type: 'newline' },
      { type: 'plain',    text: '    <' },
      { type: 'comp',     text: 'LoadingGame' },
      { type: 'newline' },
      { type: 'plain',    text: '      ' },
      { type: 'prop',     text: 'game' },
      { type: 'plain',    text: '=' },
      { type: 'str',      text: '"snake"' },
      { type: 'newline' },
      { type: 'plain',    text: '      ' },
      { type: 'prop',     text: 'active' },
      { type: 'plain',    text: '={loading}' },
      { type: 'newline' },
      { type: 'plain',    text: '      ' },
      { type: 'prop',     text: 'theme' },
      { type: 'plain',    text: "={{ primary: " },
      { type: 'str',      text: "'#7b00ff'" },
      { type: 'plain',    text: ' }}' },
      { type: 'newline' },
      { type: 'plain',    text: '      ' },
      { type: 'prop',     text: 'onComplete' },
      { type: 'plain',    text: '={() => ' },
      { type: 'fn',       text: 'setLoading' },
      { type: 'plain',    text: '(' },
      { type: 'bool',     text: 'false' },
      { type: 'plain',    text: ')}' },
      { type: 'newline' },
      { type: 'plain',    text: '    />' },
      { type: 'newline' },
      { type: 'plain',    text: '  )' },
      { type: 'newline' },
      { type: 'plain',    text: '}' },
    ],
    raw: `import { LoadingGame } from 'loading-games/react'\n\nfunction App() {\n  const [loading, setLoading] = useState(true)\n\n  return (\n    <LoadingGame\n      game="snake"\n      active={loading}\n      theme={{ primary: '#7b00ff' }}\n      onComplete={() => setLoading(false)}\n    />\n  )\n}`,
  },
  {
    label: 'Vue',
    slot: '02',
    code: [
      { type: 'tag',    text: '<script' },
      { type: 'prop',   text: ' setup' },
      { type: 'tag',    text: '>' },
      { type: 'newline' },
      { type: 'keyword', text: 'import' },
      { type: 'plain',  text: ' { ' },
      { type: 'fn',     text: 'LoadingGame' },
      { type: 'plain',  text: ' } ' },
      { type: 'keyword', text: 'from' },
      { type: 'str',    text: " 'loading-games/vue'" },
      { type: 'newline' },
      { type: 'keyword', text: 'import' },
      { type: 'plain',  text: ' { ' },
      { type: 'fn',     text: 'ref' },
      { type: 'plain',  text: ' } ' },
      { type: 'keyword', text: 'from' },
      { type: 'str',    text: " 'vue'" },
      { type: 'newline' },
      { type: 'newline' },
      { type: 'keyword', text: 'const' },
      { type: 'plain',  text: ' loading = ' },
      { type: 'fn',     text: 'ref' },
      { type: 'plain',  text: '(' },
      { type: 'bool',   text: 'true' },
      { type: 'plain',  text: ')' },
      { type: 'newline' },
      { type: 'tag',    text: '</script>' },
      { type: 'newline' },
      { type: 'newline' },
      { type: 'tag',    text: '<template>' },
      { type: 'newline' },
      { type: 'plain',  text: '  <' },
      { type: 'comp',   text: 'LoadingGame' },
      { type: 'newline' },
      { type: 'plain',  text: '    ' },
      { type: 'prop',   text: 'game' },
      { type: 'plain',  text: '=' },
      { type: 'str',    text: '"snake"' },
      { type: 'newline' },
      { type: 'plain',  text: '    :' },
      { type: 'prop',   text: 'active' },
      { type: 'plain',  text: '="loading"' },
      { type: 'newline' },
      { type: 'plain',  text: '    :' },
      { type: 'prop',   text: 'theme' },
      { type: 'plain',  text: '="{ primary: ' },
      { type: 'str',    text: "'#7b00ff'" },
      { type: 'plain',  text: ' }"' },
      { type: 'newline' },
      { type: 'plain',  text: '    @' },
      { type: 'prop',   text: 'complete' },
      { type: 'plain',  text: '="loading = ' },
      { type: 'bool',   text: 'false' },
      { type: 'plain',  text: '"' },
      { type: 'newline' },
      { type: 'plain',  text: '  />' },
      { type: 'newline' },
      { type: 'tag',    text: '</template>' },
    ],
    raw: `<script setup>\nimport { LoadingGame } from 'loading-games/vue'\nimport { ref } from 'vue'\n\nconst loading = ref(true)\n</script>\n\n<template>\n  <LoadingGame\n    game="snake"\n    :active="loading"\n    :theme="{ primary: '#7b00ff' }"\n    @complete="loading = false"\n  />\n</template>`,
  },
  {
    label: 'Svelte',
    slot: '03',
    code: [
      { type: 'tag',    text: '<script>' },
      { type: 'newline' },
      { type: 'plain',  text: '  ' },
      { type: 'keyword', text: 'import' },
      { type: 'str',    text: " 'loading-games'" },
      { type: 'newline' },
      { type: 'plain',  text: '  ' },
      { type: 'keyword', text: 'let' },
      { type: 'plain',  text: ' loading = ' },
      { type: 'bool',   text: 'true' },
      { type: 'newline' },
      { type: 'tag',    text: '</script>' },
      { type: 'newline' },
      { type: 'newline' },
      { type: 'plain',  text: '<' },
      { type: 'comp',   text: 'loading-game' },
      { type: 'newline' },
      { type: 'plain',  text: '  ' },
      { type: 'prop',   text: 'game' },
      { type: 'plain',  text: '=' },
      { type: 'str',    text: '"snake"' },
      { type: 'newline' },
      { type: 'plain',  text: '  ' },
      { type: 'prop',   text: 'active' },
      { type: 'plain',  text: "={loading ? " },
      { type: 'str',    text: "'true'" },
      { type: 'plain',  text: ' : ' },
      { type: 'bool',   text: 'undefined' },
      { type: 'plain',  text: '}' },
      { type: 'newline' },
      { type: 'plain',  text: '  on:' },
      { type: 'prop',   text: 'lg:complete' },
      { type: 'plain',  text: '={() => loading = ' },
      { type: 'bool',   text: 'false' },
      { type: 'plain',  text: '}' },
      { type: 'newline' },
      { type: 'plain',  text: '/>' },
    ],
    raw: `<script>\n  import 'loading-games'\n  let loading = true\n</script>\n\n<loading-game\n  game="snake"\n  active={loading ? 'true' : undefined}\n  on:lg:complete={() => loading = false}\n/>`,
  },
  {
    label: 'Vanilla',
    slot: '04',
    code: [
      { type: 'keyword', text: 'import' },
      { type: 'str',    text: " 'loading-games'" },
      { type: 'newline' },
      { type: 'newline' },
      { type: 'keyword', text: 'const' },
      { type: 'plain',  text: ' el = document.' },
      { type: 'fn',     text: 'querySelector' },
      { type: 'plain',  text: '(' },
      { type: 'str',    text: "'loading-game'" },
      { type: 'plain',  text: ')' },
      { type: 'newline' },
      { type: 'plain',  text: 'el.' },
      { type: 'fn',     text: 'setAttribute' },
      { type: 'plain',  text: '(' },
      { type: 'str',    text: "'active'" },
      { type: 'plain',  text: ', ' },
      { type: 'str',    text: "'true'" },
      { type: 'plain',  text: ')' },
      { type: 'newline' },
      { type: 'newline' },
      { type: 'plain',  text: 'el.' },
      { type: 'fn',     text: 'addEventListener' },
      { type: 'plain',  text: '(' },
      { type: 'str',    text: "'lg:complete'" },
      { type: 'plain',  text: ', () => {' },
      { type: 'newline' },
      { type: 'plain',  text: '  el.' },
      { type: 'fn',     text: 'removeAttribute' },
      { type: 'plain',  text: '(' },
      { type: 'str',    text: "'active'" },
      { type: 'plain',  text: ')' },
      { type: 'newline' },
      { type: 'plain',  text: '})' },
    ],
    raw: `import 'loading-games'\n\nconst el = document.querySelector('loading-game')\nel.setAttribute('active', 'true')\n\nel.addEventListener('lg:complete', () => {\n  el.removeAttribute('active')\n})`,
  },
]

type TokenType = 'keyword' | 'fn' | 'str' | 'prop' | 'comp' | 'tag' | 'bool' | 'plain' | 'newline'
const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: '#c060ff',
  fn:      '#9b30ff',
  str:     '#a8ff80',
  prop:    '#e8b4ff',
  comp:    '#d08aff',
  tag:     '#7b5fc0',
  bool:    '#ff9580',
  plain:   '#C8C8E8',
  newline: '',
}

export default function CodeTabs() {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(tabs[active]!.raw)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="w-full max-w-2xl mx-auto terminal-panel" style={{ position: 'relative' }}>
      {/* macOS chrome bar */}
      <div className="terminal-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="terminal-dot" style={{ background: '#ff5f57' }} />
          <span className="terminal-dot" style={{ background: '#febc2e' }} />
          <span className="terminal-dot" style={{ background: '#28c840' }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: '#6a6a8a',
            marginLeft: 12,
            letterSpacing: '0.05em',
          }}>
            loading-games · index.tsx
          </span>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          title="Copy code"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: copied ? '#9b30ff' : '#6a6a8a',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s',
            borderRadius: 4,
          }}
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          )}
        </button>
      </div>

      {/* Game-slot tab switcher */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '10px 16px',
        borderBottom: '1px solid rgba(123,0,255,0.12)',
        background: 'rgba(13,13,31,0.7)',
      }}>
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 6,
              border: i === active
                ? '1px solid rgba(123,0,255,0.45)'
                : '1px solid rgba(123,0,255,0.1)',
              background: i === active
                ? 'rgba(123,0,255,0.18)'
                : 'rgba(123,0,255,0.04)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: i === active ? '#e8b4ff' : '#6a6a8a',
              letterSpacing: '0.02em',
            }}
          >
            <span style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.04em' }}>{tab.slot}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Highlighted code */}
      <pre style={{
        padding: '22px 24px',
        overflowX: 'auto',
        lineHeight: 1.72,
        margin: 0,
        background: 'transparent',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 13,
      }}>
        <code>
          {tabs[active]!.code.map((token, i) => {
            if (token.type === 'newline') return <br key={i} />
            return (
              <span key={i} style={{ color: TOKEN_COLORS[token.type as TokenType] || '#C8C8E8' }}>
                {token.text}
              </span>
            )
          })}
        </code>
      </pre>
    </div>
  )
}
