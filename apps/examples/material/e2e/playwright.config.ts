import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';
import { fileURLToPath } from 'node:url';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4201';

// Browser selection: 'all' (default), 'chromium', 'firefox', or 'webkit'
const browserSelection = process.env['E2E_BROWSERS'] || 'all';

const allProjects = [
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
  ...nxE2EPreset(fileURLToPath(import.meta.url), { testDir: '../src/app/testing' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Save screenshots to material examples folder */
    screenshot: 'only-on-failure',
    /* Add action timeout to prevent hangs */
    actionTimeout: 10000,
  },
  /* Configure output directories */
  outputDir: '../screenshots',
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm exec nx run material-examples:serve --port 4201',
    url: 'http://localhost:4201',
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  projects: getProjects(),
});
