import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the Automation Practice Hub test suite.
 * - Parallel execution enabled across workers and within test files.
 * - Retries configured for reliability in CI and local environments.
 * - Auto-waiting is built-in by default in Playwright; timeouts are set for safety.
 */

/** Base URL of the application under test */
const BASE_URL = 'https://nagarjunreddykasu.github.io/web-automation-practice-site/';

export default defineConfig({
  /* Directory where test files are located */
  testDir: './tests',

  /* Run tests within each spec file in parallel */
  fullyParallel: true,

  /* Fail the build on CI if test.only is accidentally left in source code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests — 2 retries on CI, 1 retry locally */
  retries: process.env.CI ? 2 : 1,

  /* Number of parallel workers — use 50% of CPUs on CI, default locally */
  workers: process.env.CI ? 2 : undefined,

  /* Reporter configuration */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  /* Global timeout per test */
  timeout: 30_000,

  /* Expect timeout for assertions */
  expect: {
    timeout: 10_000,
  },

  /* Shared settings for all projects */
  use: {
    /* Base URL used in page.goto('/') calls */
    baseURL: BASE_URL,

    /* Collect trace on first retry for debugging */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on first retry */
    video: 'on-first-retry',

    /* Default navigation timeout */
    navigationTimeout: 15_000,

    /* Default action timeout (click, fill, etc.) */
    actionTimeout: 10_000,
  },

  /* Configure projects for cross-browser testing */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
