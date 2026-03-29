export const svelteSnippet = `<script>
  import { loadingGame } from 'loading-games/svelte'

  let active = true

  function handleScore(e) {
    console.log('Score:', e.detail)
  }

  function handleComplete() {
    active = false
  }
</script>

<!-- Option A: Use the Svelte action -->
<div use:loadingGame={{ game: 'snake', active, onScore: (s) => console.log(s), onComplete: () => active = false }} />

<!-- Option B: Use the web component directly -->
<loading-game
  game="snake"
  active={active ? 'true' : undefined}
  on:lg:score={handleScore}
  on:lg:complete={handleComplete}
/>
`
