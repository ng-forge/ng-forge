import { defineConfig, devices, PlaywrightTestConfig, ReporterDescription } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';
import { fileURLToPath } from 'node:url';
import { APP_PORTS, ExampleApp } from './app-config';

/**
 * Returns the reporter configuration based on CI environment.
 * In CI, includes JSON reporter for job summary generation.
 */
const getReporters = (): ReporterDescription[] => {
  const reporters: ReporterDescription[] = [['list'], ['html', { outputFolder: './playwright-report', open: 'never' }]];

  // Add JSON reporter in CI for generating job summaries
  if (process.env['CI']) {
    reporters.push(['json', { outputFile: './test-results/results.json' }]);
  }

  return reporters;
};

// Re-export for backwards compatibility
export { APP_PORTS, type ExampleApp } from './app-config';

/**
 * Browser project configurations with Firefox-specific timeouts.
 */
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

/**
 * Returns browser projects based on E2E_BROWSERS environment variable.
 * Supports: 'all' (default), 'chromium', 'firefox', 'webkit', or comma-separated list.
 */
const getProjects = () => {
  const browserSelection = process.env['E2E_BROWSERS'] || 'all';
  if (browserSelection === 'all') {
    return allProjects;
  }
  const selectedBrowsers = browserSelection.split(',').map((b: string) => b.trim());
  return allProjects.filter((p) => selectedBrowsers.includes(p.name));
};

/**
 * Creates a Playwright configuration for an example application.
 *
 * @param configFileUrl - Pass `import.meta.url` from the config file
 * @param appName - The example app name (e.g., 'material-examples')
 * @returns Complete Playwright configuration
 *
 * @example
 * ```ts
 * // playwright.config.ts
 * import { createPlaywrightConfig } from '@ng-forge/examples-shared-testing/playwright-config';
 * export default createPlaywrightConfig(import.meta.url, 'material-examples');
 * ```
 */
export function createPlaywrightConfig(configFileUrl: string, appName: ExampleApp): PlaywrightTestConfig {
  const port = APP_PORTS[appName];
  const baseURL = process.env['BASE_URL'] || `http://localhost:${port}`;

  return defineConfig({
    ...nxE2EPreset(fileURLToPath(configFileUrl), { testDir: './src/app/testing' }),
    /* Configure reporters - includes JSON in CI for job summary generation */
    reporter: getReporters(),
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
      command: `pnpm exec nx run ${appName}:serve --port ${port}`,
      url: `http://localhost:${port}`,
      reuseExistingServer: true,
      cwd: workspaceRoot,
      /* Allow longer startup time in Docker environments */
      timeout: 180000,
    },
    projects: getProjects(),
  });
}
