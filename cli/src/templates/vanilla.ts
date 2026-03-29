export const vanillaSnippet = `import 'loading-games'

// HTML:
// <loading-game id="game" game="snake" size="md"></loading-game>

// Start the game:
const game = document.querySelector('loading-game')
game.setAttribute('active', 'true')

// Listen for events:
game.addEventListener('lg:score', (e) => console.log('Score:', e.detail))
game.addEventListener('lg:complete', () => console.log('Loading complete!'))
game.addEventListener('lg:gameover', (e) => console.log('Game over:', e.detail))

// Stop the game:
game.removeAttribute('active')

// Update theme at runtime:
game.theme = { primary: '#6366F1', background: '#0F0F0F' }
`
