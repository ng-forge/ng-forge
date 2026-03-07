import { defineConfig, devices, PlaywrightTestConfig, ReporterDescription } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';
import { fileURLToPath } from 'node:url';
import { APP_PORTS } from '@ng-forge/examples-shared-testing/playwright-config';
import type { AdapterName } from '@ng-forge/sandbox-harness';

// 'custom' is a virtual adapter name in the harness; it has no dedicated E2E test suite
type SandboxAdapter = Exclude<AdapterName, 'custom'>;

const PORT = APP_PORTS['sandbox-examples'];

const allProjects = [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox'],
      actionTimeout: 8000,
      navigationTimeout: 15000,
    },
    timeout: 15000,
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
];

/**
 * Creates a Playwright configuration for a specific adapter in the sandbox example app.
 *
 * @param configFileUrl - Pass `import.meta.url` from the config file
 * @param adapterName - The adapter to test (e.g., 'material', 'bootstrap')
 * @returns Complete Playwright configuration
 */
export function createSandboxPlaywrightConfig(configFileUrl: string, adapterName: SandboxAdapter): PlaywrightTestConfig {
  const baseURL = process.env['BASE_URL'] || `http://localhost:${PORT}`;
  const testDir = `./src/app/testing/${adapterName}`;

  const browserSelection = process.env['E2E_BROWSERS'] || 'all';
  const projects =
    browserSelection === 'all'
      ? allProjects
      : allProjects.filter((p) =>
          browserSelection
            .split(',')
            .map((b) => b.trim())
            .includes(p.name),
        );

  const reporters: ReporterDescription[] = [['list'], ['html', { outputFolder: './playwright-report', open: 'never' }]];
  if (process.env['CI']) {
    reporters.push(['json', { outputFile: './test-results/results.json' }]);
  }

  return defineConfig({
    ...nxE2EPreset(fileURLToPath(configFileUrl), { testDir }),
    reporter: reporters,
    timeout: 10000,
    retries: 1,
    expect: {
      timeout: 5000,
      toHaveScreenshot: {
        // 1% pixel diff covers anti-aliasing; 0.2 colour distance covers subpixel rendering
        maxDiffPixelRatio: 0.01,
        threshold: 0.2,
        animations: 'disabled',
      },
    },
    use: {
      baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      actionTimeout: 5000,
      navigationTimeout: 10000,
    },
    outputDir: './test-results',
    snapshotDir: `./src/app/testing/__snapshots__`,
    snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
    webServer: {
      command: `pnpm exec nx run sandbox-examples:serve --port ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: true,
      cwd: workspaceRoot,
      timeout: 180000,
    },
    projects,
  });
}
