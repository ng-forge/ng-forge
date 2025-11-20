/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig(({ mode }) => {
  // Browser mode can be enabled by setting VITEST_BROWSER=true
  // Note: Browser mode requires significant resources and may not work well in
  // containerized environments with large test suites. Use jsdom for most testing.
  const browserEnabled = process.env.VITEST_BROWSER === 'true';

  const isCI = process.env.CI === 'true';
  const chromeArgs = [
    '--disable-dev-shm-usage', // Prevents shared memory issues in containers
    '--disable-gpu', // Reduces memory usage in headless mode
    '--no-sandbox', // Required for containerized environments
    '--disable-setuid-sandbox', // Required for containerized environments
  ];

  // Only add additional flags in CI
  if (isCI) {
    chromeArgs.push('--disable-features=VizDisplayCompositor');
  }

  const testConfig: any = {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    browser: {
      enabled: browserEnabled,
      instances: [
        {
          browser: 'chromium',
          provider: playwright({
            launch: {
              args: chromeArgs,
            },
          }),
        },
      ],
      headless: true,
      fileParallelism: false,
      slowTestThreshold: 10000,
    },
    testTimeout: 60000,
    hookTimeout: 60000,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      enabled: true,
      reportsDirectory: '../../coverage/packages/dynamic-form',
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
    },
  };

  // Only set environment for non-browser mode
  if (!browserEnabled) {
    testConfig.environment = 'jsdom';
  }

  return {
    plugins: [
      angular({
        workspaceRoot: '../../',
      }),
      nxViteTsPaths(),
    ],
    optimizeDeps: {
      include: ['@vitest/coverage-istanbul'],
    },
    test: testConfig,
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
