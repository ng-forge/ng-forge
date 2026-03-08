import { createPlaywrightConfig } from '@ng-forge/examples-shared-testing/playwright-config';
import { devices } from '@playwright/test';

const config = createPlaywrightConfig(import.meta.url, 'core-examples');

export default {
  ...config,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  timeout: 15000,
};
