#!/usr/bin/env node
/**
 * loading-games CLI
 * Usage: npx loading-games init [--dry-run]
 *
 * Detects the current framework and prints the exact integration snippet.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { reactSnippet } from './templates/react.js'
import { vueSnippet } from './templates/vue.js'
import { svelteSnippet } from './templates/svelte.js'
import { vanillaSnippet } from './templates/vanilla.js'

const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const DIM = '\x1b[2m'
const YELLOW = '\x1b[33m'

const args = process.argv.slice(2)
const command = args.find(a => !a.startsWith('-')) ?? 'init'
const dryRun = args.includes('--dry-run')

if (command !== 'init') {
  console.error(`Unknown command: ${command}. Usage: npx loading-games init [--dry-run]`)
  process.exit(1)
}

// ─── Framework Detection ─────────────────────────────────────────────────────────

type Framework = 'react' | 'vue' | 'svelte' | 'angular' | 'vanilla'

interface DetectionResult {
  framework: Framework
  configFile?: string
}

const CONFIG_FILES: Record<string, Framework> = {
  'next.config.js': 'react',
  'next.config.ts': 'react',
  'next.config.mjs': 'react',
  'nuxt.config.js': 'vue',
  'nuxt.config.ts': 'vue',
  'svelte.config.js': 'svelte',
  'svelte.config.ts': 'svelte',
  'vite.config.ts': 'vanilla', // might be React/Vue/Svelte — deps take priority
  'vite.config.js': 'vanilla',
  'angular.json': 'angular',
}

function detectFramework(): DetectionResult {
  const cwd = process.cwd()

  // 1. Check config files first for extra info
  let configFile: string | undefined
  let configFramework: Framework | undefined
  for (const [file, fw] of Object.entries(CONFIG_FILES)) {
    if (fs.existsSync(path.resolve(cwd, file))) {
      configFile = file
      configFramework = fw
      break
    }
  }

  // 2. Check package.json deps (takes priority for framework detection)
  try {
    const pkgPath = path.resolve(cwd, 'package.json')
    if (!fs.existsSync(pkgPath)) return { framework: configFramework ?? 'vanilla', configFile }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }

    if ('svelte' in deps) return { framework: 'svelte', configFile }
    if ('vue' in deps || 'nuxt' in deps) return { framework: 'vue', configFile }
    if ('@angular/core' in deps) return { framework: 'angular', configFile }
    if ('react' in deps || 'next' in deps) return { framework: 'react', configFile }
  } catch {
    // ignore
  }

  return { framework: configFramework ?? 'vanilla', configFile }
}

function detectPackageManager(): 'pnpm' | 'yarn' | 'npm' {
  const cwd = process.cwd()
  if (fs.existsSync(path.resolve(cwd, 'pnpm-lock.yaml'))) return 'pnpm'
  if (fs.existsSync(path.resolve(cwd, 'yarn.lock'))) return 'yarn'
  return 'npm'
}

// ─── Snippets Map ─────────────────────────────────────────────────────────────

const snippets: Record<Framework, string> = {
  react: reactSnippet,
  vue: vueSnippet,
  svelte: svelteSnippet,
  angular: `// Angular wrapper coming in v1.1.
// For now, use the Web Component directly:
// 1. Add CUSTOM_ELEMENTS_SCHEMA to your module
// 2. Import 'loading-games' in main.ts

<loading-game
  game="snake"
  [attr.active]="isLoading ? 'true' : null"
></loading-game>`,
  vanilla: vanillaSnippet,
}

// ─── Install ────────────────────────────────────────────────────────────────

function installPackage(pm: 'pnpm' | 'yarn' | 'npm'): void {
  const cmd =
    pm === 'pnpm' ? 'pnpm add loading-games' :
    pm === 'yarn' ? 'yarn add loading-games' :
    'npm install loading-games'

  if (dryRun) {
    console.log(`\n${YELLOW}[dry-run]${RESET} Would run: ${DIM}${cmd}${RESET}`)
    return
  }

  console.log(`\n${DIM}Running: ${cmd}${RESET}`)
  try {
    execSync(cmd, { stdio: 'inherit' })
    console.log(`${GREEN}\u2713 Installed loading-games${RESET}`)
  } catch {
    console.error('Failed to install. Run manually:')
    console.error(`  ${BOLD}${cmd}${RESET}`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────

const { framework, configFile } = detectFramework()
const pm = detectPackageManager()

console.log(`\n${BOLD}\u26A1 loading-games init${RESET}${dryRun ? ` ${YELLOW}(dry-run)${RESET}` : ''}`)
console.log(`${DIM}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`)
console.log(`${GREEN}\u2713 Detected framework: ${BOLD}${framework}${RESET}`)
if (configFile) {
  console.log(`${GREEN}\u2713 Config file: ${BOLD}${configFile}${RESET}`)
}
console.log(`${GREEN}\u2713 Package manager: ${BOLD}${pm}${RESET}`)

installPackage(pm)

console.log(`\n${CYAN}${BOLD}Copy this snippet into your component:${RESET}\n`)
console.log(snippets[framework])

console.log(`\n${DIM}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`)
console.log(`${GREEN}${BOLD}Done!${RESET} Games available: snake, flappy, brick-breaker, 2048,`)
console.log(`       wordle-lite, asteroids, memory-cards, whack-a-mole, random`)
console.log(`\n${DIM}Docs: https://loading.games/docs${RESET}\n`)
