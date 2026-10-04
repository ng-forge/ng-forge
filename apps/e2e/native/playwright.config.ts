import { defineConfig, devices } from '@playwright/test';

// The Maestro suite's web counterpart: the same scenarios, rendered by @ng-native/web.
export default defineConfig({
  testDir: 'e2e-web',
  outputDir: 'build/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  reporter: process.env['CI'] ? [['list'], ['junit', { outputFile: 'build/playwright/report.xml' }]] : 'list',
  use: { baseURL: 'http://localhost:4220', trace: 'retain-on-failure' },
  projects: [
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 411, height: 914 } }, grepInvert: /@tablet/ },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 834, height: 1194 } }, grep: /@tablet/ },
  ],
  webServer: {
    command: 'npm run build:web && npx vite preview --config vite.web.config.mts --outDir build/web',
    url: 'http://localhost:4220',
    reuseExistingServer: !process.env['CI'],
  },
});
