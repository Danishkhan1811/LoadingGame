import { defineConfig } from 'tsup'

export default defineConfig([
  // Core entry point — must stay < 8 kB gzipped
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'vue', 'svelte'],
    treeshake: true,
    minify: true,
  },
  // Each game as a separate chunk — must stay < 10 kB gzipped each
  {
    entry: {
      'games/snake': 'src/games/snake/index.ts',
      'games/brick-breaker': 'src/games/brick-breaker/index.ts',
      'games/flappy': 'src/games/flappy/index.ts',
      'games/2048': 'src/games/2048/index.ts',
      'games/wordle-lite': 'src/games/wordle-lite/index.ts',
      'games/asteroids': 'src/games/asteroids/index.ts',
      'games/memory-cards': 'src/games/memory-cards/index.ts',
      'games/whack-a-mole': 'src/games/whack-a-mole/index.ts',
    },
    format: ['esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: true,
  },
  // React wrapper
  {
    entry: { 'react/index': 'src/react/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    external: ['react', 'react/jsx-runtime', /\.\.\//],
    minify: true,
  },
  // Vue wrapper
  {
    entry: { 'vue/index': 'src/vue/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    external: ['vue', /\.\.\//],
    minify: true,
  },
  // Svelte wrapper
  {
    entry: { 'svelte/index': 'src/svelte/index.ts' },
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    external: ['svelte', /\.\.\//],
    minify: true,
  },
])
