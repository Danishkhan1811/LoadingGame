## Description

<!-- What does this PR do? -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] New game
- [ ] Documentation
- [ ] Refactor
- [ ] CI/CD

## Checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm size-limit` passes (no bundle size regressions)
- [ ] Documentation updated (if applicable)

## Game Submission Checklist (if adding a new game)

- [ ] Implements all 5 required methods: `init`, `start`, `pause`, `resume`, `destroy`
- [ ] Uses only `requestAnimationFrame` for animation
- [ ] Applies theme colors from `resolveTheme(theme)`
- [ ] `destroy()` removes ALL event listeners and cancels ALL animation frames
- [ ] Scales canvas for `window.devicePixelRatio`
- [ ] Has touch controls
- [ ] Has keyboard controls
- [ ] Bundle size < 10 kB gzipped
