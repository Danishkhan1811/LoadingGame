export const reactSnippet = `import { LoadingGame } from 'loading-games/react'

function MyComponent() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <LoadingGame
      game="snake"
      active={isLoading}
      theme={{ primary: '#6366F1', background: '#0F0F0F' }}
      onScore={(score) => console.log('Score:', score)}
      onComplete={() => setIsLoading(false)}
    />
  )
}
`
