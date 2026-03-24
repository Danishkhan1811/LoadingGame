#!/usr/bin/env node
/**
 * loading-games CLI
 * Usage: npx loading-games init
 *
 * Detects the current framework and prints the exact integration snippet.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const DIM = '\x1b[2m'

const [, , command = 'init'] = process.argv

if (command !== 'init') {
  console.error(`Unknown command: ${command}. Usage: npx loading-games init`)
  process.exit(1)
}

// ─── Framework Detection ────────────────────────────────────────────────────

type Framework = 'react' | 'vue' | 'svelte' | 'angular' | 'vanilla'

function detectFramework(): Framework {
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json')
    if (!fs.existsSync(pkgPath)) return 'vanilla'

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }

    if ('svelte' in deps) return 'svelte'
    if ('vue' in deps) return 'vue'
    if ('@angular/core' in deps) return 'angular'
    if ('react' in deps) return 'react'
  } catch {
    // ignore
  }
  return 'vanilla'
}

function detectPackageManager(): 'pnpm' | 'yarn' | 'npm' {
  if (fs.existsSync(path.resolve(process.cwd(), 'pnpm-lock.yaml'))) return 'pnpm'
  if (fs.existsSync(path.resolve(process.cwd(), 'yarn.lock'))) return 'yarn'
  return 'npm'
}

// ─── Code Snippets ──────────────────────────────────────────────────────────

const snippets: Record<Framework, string> = {
  react: `import { LoadingGame } from 'loading-games/react'

// In your component:
<LoadingGame
  game="snake"
  active={isLoading}
  theme={{ primary: '#6366F1', background: '#0F0F0F' }}
  onComplete={() => setShowResult(true)}
/>`,

  vue: `import { LoadingGame } from 'loading-games/vue'

// In your template:
<LoadingGame
  game="snake"
  :active="isLoading"
  :theme="{ primary: '#6366F1', background: '#0F0F0F' }"
  @complete="handleComplete"
/>`,

  svelte: `import { LoadingGame } from 'loading-games/svelte'

// In your template:
<LoadingGame
  game="snake"
  {active}
  theme={{ primary: '#6366F1', background: '#0F0F0F' }}
  on:complete={handleComplete}
/>`,

  angular: `// Angular wrapper coming in v1.1.
// For now, use the Web Component directly:
// 1. Add CUSTOM_ELEMENTS_SCHEMA to your module
// 2. Import 'loading-games' in main.ts

<loading-game
  game="snake"
  [attr.active]="isLoading ? 'true' : null"
  theme-primary="#6366F1"
></loading-game>`,

  vanilla: `import 'loading-games'

// HTML:
<loading-game game="snake" active="true" theme-primary="#6366F1"></loading-game>

// Or imperatively:
const game = document.querySelector('loading-game')
game.setAttribute('active', 'true')  // start
game.removeAttribute('active')       // stop`,
}

// ─── Install ────────────────────────────────────────────────────────────────

function installPackage(pm: 'pnpm' | 'yarn' | 'npm'): void {
  const cmd =
    pm === 'pnpm' ? 'pnpm add loading-games' :
    pm === 'yarn' ? 'yarn add loading-games' :
    'npm install loading-games'

  console.log(`\n${DIM}Running: ${cmd}${RESET}`)
  try {
    execSync(cmd, { stdio: 'inherit' })
    console.log(`${GREEN}✓ Installed loading-games${RESET}`)
  } catch {
    console.error('Failed to install. Run manually:')
    console.error(`  ${BOLD}${cmd}${RESET}`)
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

const framework = detectFramework()
const pm = detectPackageManager()

console.log(`\n${BOLD}⚡ loading-games init${RESET}`)
console.log(`${DIM}─────────────────────────────────${RESET}`)
console.log(`${GREEN}✓ Detected framework: ${BOLD}${framework}${RESET}`)
console.log(`${GREEN}✓ Package manager: ${BOLD}${pm}${RESET}`)

installPackage(pm)

console.log(`\n${CYAN}${BOLD}Copy this snippet into your component:${RESET}\n`)
console.log(snippets[framework])

console.log(`\n${DIM}─────────────────────────────────${RESET}`)
console.log(`${GREEN}${BOLD}Done!${RESET} Games available: snake, flappy, brick-breaker, 2048,`)
console.log(`       wordle-lite, asteroids, memory-cards, whack-a-mole, random`)
console.log(`\n${DIM}Docs: https://loading.games/docs${RESET}\n`)
