import { useState } from 'react'

const tabs = [
  {
    label: 'React',
    code: `import { LoadingGame } from 'loading-games/react'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <LoadingGame
      game="snake"
      active={loading}
      theme={{ primary: '#6366F1' }}
      onComplete={() => setLoading(false)}
    />
  )
}`,
  },
  {
    label: 'Vue',
    code: `<script setup>
import { LoadingGame } from 'loading-games/vue'
import { ref } from 'vue'

const loading = ref(true)
</script>

<template>
  <LoadingGame
    game="snake"
    :active="loading"
    :theme="{ primary: '#6366F1' }"
    @complete="loading = false"
  />
</template>`,
  },
  {
    label: 'Svelte',
    code: `<script>
  import 'loading-games'
  let loading = true
</script>

<loading-game
  game="snake"
  active={loading ? 'true' : undefined}
  on:lg:complete={() => loading = false}
/>`,
  },
  {
    label: 'Vanilla',
    code: `import 'loading-games'

const el = document.querySelector('loading-game')
el.setAttribute('active', 'true')

el.addEventListener('lg:complete', () => {
  el.removeAttribute('active')
})`,
  },
]

export default function CodeTabs() {
  const [active, setActive] = useState(0)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex border-b border-gray-700">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              i === active
                ? 'text-brand-400 border-b-2 border-brand-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <pre className="code-block mt-0 rounded-t-none text-gray-300">
        <code>{tabs[active]!.code}</code>
      </pre>
    </div>
  )
}
