# loading-games — Launch & Completion Guide

## Current Project Status

**Phases 1–8 are code-complete.** The 4 remaining game implementations (Phase 3) are intentionally deferred to post-launch v1.1.

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Monorepo Scaffold | ✅ Complete | pnpm + turbo + tsup |
| 2. Fix Existing Games | ✅ Complete | Snake, Flappy, Memory Cards, Whack-a-Mole |
| 3. Remaining 4 Games | 🔲 Deferred (v1.1) | Brick-breaker, 2048, Wordle-lite, Asteroids are stubs |
| 4. Framework Wrappers | ✅ Complete | React, Vue 3, Svelte |
| 5. UX Polish & A11y | ✅ Complete | D-pad, onGameOver, errorDeactivate, aria-labels |
| 6. CLI Tool Polish | ✅ Complete | Templates, config detection, --dry-run |
| 7. Demo Site | ✅ Complete | Astro + React + Tailwind, 4 pages |
| 8. Launch Prep | ✅ Complete | CI/CD, npm dry-run, README, docs |

---

## What You Need to Call It "Complete" for v1.0

### ✅ Already Done (automated)

- [x] **4 fully playable games** — Snake, Flappy Bird, Memory Cards, Whack-a-Mole
- [x] **4 stub games** — Brick-breaker, 2048, Wordle-lite, Asteroids (show "Coming Soon" UI)
- [x] **Framework wrappers** — React, Vue 3, Svelte + vanilla Web Component
- [x] **TypeScript types** — Full `.d.ts` for all exports
- [x] **CLI tool** — `npx loading-games init` with framework detection
- [x] **Accessibility** — aria-labels, skip link, virtual D-pad, reduced-motion support
- [x] **Events** — `lg:score`, `lg:gameover`, `lg:complete`, `lg:error`
- [x] **Theming** — CSS variables, explicit props, dark/light auto-detection
- [x] **Scores** — localStorage persistence with namespace support
- [x] **Demo site** — 4-page Astro site: home, games, configurator, docs
- [x] **CI/CD** — GitHub Actions: typecheck, lint, test, build, size-limit, Playwright E2E
- [x] **Tests** — 16 unit tests + 3 Playwright E2E tests passing
- [x] **npm publish --dry-run** passes (38 files, 138.3 kB)

### 📋 Manual Steps Before Publish

1. **Set your npm account & GitHub repo URL**
   - Update `repository.url` in `packages/core/package.json` from `your-org` to your actual GitHub username/org
   - Update GitHub links in `apps/demo/src/layouts/Layout.astro`
   - Update badges in `README.md`

2. **npm login** (if not already)
   ```bash
   npm login
   ```

3. **Run the full verification suite**
   ```bash
   pnpm build                                    # Build everything
   pnpm typecheck                                # TypeScript clean
   pnpm test                                     # 16 unit tests
   pnpm --filter loading-games test:e2e          # 3 Playwright E2E tests
   npm publish --dry-run -w packages/core        # Verify tarball contents
   ```

4. **Test the package from a tarball locally**
   ```bash
   cd packages/core
   npm pack                                      # Creates loading-games-0.0.1.tgz
   
   # In a fresh test project:
   mkdir /tmp/test-app && cd /tmp/test-app
   npm init -y
   npm install /path/to/loading-games-0.0.1.tgz
   
   # Verify imports work:
   node -e "import('loading-games').then(m => console.log(Object.keys(m)))"
   ```

5. **Preview the demo site locally**
   ```bash
   pnpm --filter loading-games-demo dev          # http://localhost:4321
   ```
   Check all 4 pages: `/`, `/games`, `/configurator`, `/docs`

---

## How to Publish

### Option A: Manual publish (simplest)

```bash
# 1. Bump version
cd packages/core
npm version 1.0.0

# 2. Build
cd ../..
pnpm build

# 3. Publish
cd packages/core
npm publish --access public
```

### Option B: Via changesets (automated, recommended)

```bash
# 1. Create a changeset
pnpm changeset

# Choose: loading-games → major (1.0.0)
# Summary: "Initial public release — 4 playable games, React/Vue/Svelte wrappers"

# 2. Version
pnpm changeset version

# 3. Build & publish
pnpm build
cd packages/core
npm publish --access public

# 4. Commit & tag
cd ../..
git add -A
git commit -m "chore: release loading-games v1.0.0"
git tag loading-games@1.0.0
git push --follow-tags
```

### Option C: GitHub Actions (fully automated)

Push to `main` with a changeset → `release.yml` handles versioning + npm publish.

**Required secrets:**
- `NPM_TOKEN` — Create at https://www.npmjs.com/settings/tokens (Automation type)
- `GITHUB_TOKEN` — Automatically provided by GitHub Actions

---

## How to Test the Library

### Unit Tests
```bash
pnpm test                        # Runs vitest — 16 tests
```
Tests cover: score storage, delay controller, theme resolution.

### E2E Tests  
```bash
pnpm --filter loading-games test:e2e    # Runs Playwright — 3 tests
```
Tests cover:
- Canvas renders when `active="true"` with correct aria-label
- Game exits and canvas is removed when active is removed
- Game never appears if deactivated before delay

### Manual Testing Checklist

| Test | How |
|------|-----|
| Snake plays correctly | Open demo site → Games → Snake. Use arrow keys. |
| Flappy plays correctly | Open demo site → Games → Flappy. Press space to flap. |
| Memory Cards works | Click cards, match pairs, score increases |
| Whack-a-Mole works | Click moles during 20-second round |
| Theme changes apply | Configurator → change colors → verify game updates |
| Delay works | Set `delay="2000"`, activate, wait <2s then deactivate → game never shows |
| Exit animation | Activate game, wait for it to show, deactivate → fade out |
| Score persistence | Play Snake, score points, refresh page, score persists |
| React wrapper | In a React project: `import { LoadingGame } from 'loading-games/react'` |
| Vue wrapper | In a Vue project: `import { LoadingGame } from 'loading-games/vue'` |
| CLI tool | `node cli/dist/index.js init --dry-run` detects framework correctly |
| Mobile D-pad | Open Snake on a touch device → D-pad overlay appears |
| Skip link | Tab into the game → first tab stop is "Skip game" link |
| Reduced motion | Set `prefers-reduced-motion: reduce` → game shows static pattern |

---

## Deploy the Demo Site

The Astro demo builds to static HTML:

```bash
pnpm --filter loading-games-demo build     # Output: apps/demo/dist/
```

### Netlify
```bash
# In Netlify dashboard:
# Build command:  pnpm --filter loading-games-demo build
# Publish dir:    apps/demo/dist
# Or use CLI:
npx netlify deploy --dir=apps/demo/dist --prod
```

### Vercel
```bash
cd apps/demo
npx vercel --prod
```

### GitHub Pages
Add to `.github/workflows/`:
```yaml
- name: Build demo
  run: pnpm --filter loading-games-demo build
- name: Deploy to Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./apps/demo/dist
```

---

## What's Left for v1.1 (The 4 Remaining Games)

| Game | Complexity | Priority |
|------|-----------|----------|
| `brick-breaker` | Medium — paddle physics, ball bounce, power-ups | High |
| `2048` | Medium — grid merge logic, animations | High |
| `wordle-lite` | Medium — word list, keyboard UI, color feedback | Medium |
| `asteroids` | Hard — vector movement, rotation, particles | Low |

Each stub is already wired with:
- Constructor accepting `onScore` + `onGameOver` callbacks
- `GamePlugin` interface: `init()`, `start()`, `pause()`, `resume()`, `destroy()`, `getScore()`
- "Coming Soon" render in the canvas

To implement a new game, copy the pattern from `packages/core/src/games/snake/index.ts`.

---

## Project Structure Reference

```
LoadingGame/
├── packages/core/          # Main library
│   ├── src/
│   │   ├── index.ts        # Main entry + auto-register
│   │   ├── component.ts    # <loading-game> Web Component
│   │   ├── controller.ts   # GameController (lifecycle, events)
│   │   ├── dpad.ts         # Reusable virtual D-pad
│   │   ├── types.ts        # All TypeScript types
│   │   ├── theme.ts        # Theme resolution
│   │   ├── scores.ts       # localStorage score persistence
│   │   ├── delay.ts        # Delay controller
│   │   ├── games/          # Game implementations
│   │   │   ├── snake/
│   │   │   ├── flappy/
│   │   │   ├── memory-cards/
│   │   │   ├── whack-a-mole/
│   │   │   ├── brick-breaker/   (stub)
│   │   │   ├── 2048/            (stub)
│   │   │   ├── wordle-lite/     (stub)
│   │   │   └── asteroids/       (stub)
│   │   ├── react/          # React wrapper
│   │   ├── vue/            # Vue 3 wrapper
│   │   └── svelte/         # Svelte wrapper
│   ├── tests/
│   │   ├── core.test.ts    # 16 unit tests
│   │   └── e2e/            # 3 Playwright E2E tests
│   └── dist/               # Built output
├── cli/                    # CLI tool (npx loading-games init)
├── apps/demo/              # Astro demo site
└── .github/workflows/      # CI + Release
```

---

## Quick Commands Reference

| Command | What it does |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm typecheck` | TypeScript check all packages |
| `pnpm test` | Run unit tests |
| `pnpm --filter loading-games test:e2e` | Run Playwright E2E tests |
| `pnpm --filter loading-games-demo dev` | Start demo site dev server |
| `pnpm --filter loading-games-demo build` | Build demo site |
| `node cli/dist/index.js init --dry-run` | Test CLI without installing |
| `npm publish --dry-run -w packages/core` | Preview npm publish |
| `npm pack -w packages/core` | Create local tarball for testing |
