/**
 * Playwright E2E tests for <loading-game> web component.
 *
 * Tests:
 * 1. Mount with active="true" → canvas renders
 * 2. Set active false → game exits with animation
 * 3. Fast load (<800ms) → game never appears
 */

import { test, expect } from '@playwright/test'

const fixtureUrl = '/tests/e2e/fixture.html'

test.describe('<loading-game> E2E', () => {
  test('renders canvas when active="true" is set', async ({ page }) => {
    await page.goto(fixtureUrl)
    // Give the module time to load and register the custom element
    await page.waitForTimeout(500)

    // Set active attribute
    await page.evaluate(() => {
      document.getElementById('game')!.setAttribute('active', 'true')
    })

    // Wait for the delay (800ms default) + some buffer for game loading
    const canvas = page.locator('loading-game canvas')
    await expect(canvas).toBeVisible({ timeout: 8000 })

    // Canvas should have the correct aria-label
    const ariaLabel = await canvas.getAttribute('aria-label')
    expect(ariaLabel).toContain('game')
    expect(ariaLabel).toContain('loading in background')
  })

  test('game exits when active is removed', async ({ page }) => {
    await page.goto(fixtureUrl)
    await page.waitForTimeout(500)

    // Activate the game
    await page.evaluate(() => {
      document.getElementById('game')!.setAttribute('active', 'true')
    })

    // Wait for game to appear
    const canvas = page.locator('loading-game canvas')
    await expect(canvas).toBeVisible({ timeout: 8000 })

    // Now deactivate
    await page.evaluate(() => {
      document.getElementById('game')!.removeAttribute('active')
    })

    // Wait for exit animation + completion overlay (1.5s) + exit (350ms) + buffer
    await page.waitForTimeout(4000)

    // Canvas should be removed after exit
    const canvasCount = await page.locator('loading-game canvas').count()
    expect(canvasCount).toBe(0)
  })

  test('game never appears if loading completes before delay', async ({ page }) => {
    await page.goto(fixtureUrl)
    await page.waitForTimeout(500)

    // Set a long delay so we can deactivate before it fires
    await page.evaluate(() => {
      const el = document.getElementById('game')!
      el.setAttribute('delay', '3000')
      el.setAttribute('active', 'true')
    })

    // Wait less than the delay, then deactivate
    await page.waitForTimeout(500)
    await page.evaluate(() => {
      document.getElementById('game')!.removeAttribute('active')
    })

    // Wait a bit more to ensure nothing appeared
    await page.waitForTimeout(1500)

    // No canvas should have been created
    const canvasCount = await page.locator('loading-game canvas').count()
    expect(canvasCount).toBe(0)
  })
})
