import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';
import { fileURLToPath } from 'node:url';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4203';

// Browser selection: 'all' (default), 'chromium', 'firefox', or 'webkit'
const browserSelection = process.env['E2E_BROWSERS'] || 'all';

const allProjects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox'],
      // Firefox needs longer timeouts when running in parallel with many tests
      actionTimeout: 8000,
      navigationTimeout: 15000,
    },
    // Increase timeout for Firefox tests
    timeout: 15000,
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
];

const getProjects = () => {
  if (browserSelection === 'all') {
    return allProjects;
  }
  return allProjects.filter((p) => p.name === browserSelection);
};

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(fileURLToPath(import.meta.url), { testDir: './src/app/testing' }),
  /* Global timeout for each test - prevents tests from hanging indefinitely */
  timeout: 10000,
  /* Retry flaky tests once */
  retries: 1,
  /* Expect timeout - how long to wait for expect() assertions */
  expect: {
    timeout: 5000,
    /* Snapshot comparison thresholds for visual regression tests */
    toHaveScreenshot: {
      /* 1% of pixels can differ - catches real changes while allowing anti-aliasing differences */
      maxDiffPixelRatio: 0.01,
      /* 20% color difference tolerance per pixel */
      threshold: 0.2,
      /* Disable animations for consistent snapshots */
      animations: 'disabled',
    },
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Save screenshots on failure for debugging */
    screenshot: 'only-on-failure',
    /* Add action timeout to prevent hangs */
    actionTimeout: 5000,
    /* Navigation timeout - prevents page.goto() from hanging */
    navigationTimeout: 10000,
  },
  /* Configure output directories for test artifacts */
  outputDir: './test-results',
  /* Store baseline snapshots in src directory (committed to git) */
  /* Use Docker (scripts/playwright-docker.sh) locally to match CI rendering */
  snapshotDir: './src/app/testing/__snapshots__',
  /* Configure snapshot path template */
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm exec nx run ionic-examples:serve --port 4203',
    url: 'http://localhost:4203',
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  projects: getProjects(),
});
