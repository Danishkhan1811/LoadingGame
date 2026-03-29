import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 15_000,
  retries: 0,
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: 'http://localhost:3456',
  },
  webServer: {
    command: 'node tests/e2e/serve.mjs',
    port: 3456,
    reuseExistingServer: true,
  },
})
