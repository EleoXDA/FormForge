import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for FormForge end-to-end tests.
 *
 * The E2E suite exercises the flows that run entirely client-side (no backend):
 * the builder loads in demo mode, and the runtime renderer renders, validates,
 * and submits forms. Tests seed the persisted editor store via localStorage so
 * they are deterministic and do not depend on drag-and-drop timing.
 *
 * Flows that require a configured Supabase backend (publish, public submission,
 * dashboard listing, embed) are documented in the suite but not asserted here,
 * so the suite stays green without secrets.
 */
const PORT = 5173
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  // Fail the build on CI if test.only is left in the source.
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  fullyParallel: true,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  // Start the Vite dev server (handles SPA history fallback for deep links).
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000
  }
})
