/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig(({ mode }) => {
  // Conditionally add --no-sandbox only in CI environments
  const isCI = process.env.CI === 'true';
  const chromeArgs = [
    '--disable-dev-shm-usage', // Prevents shared memory issues in containers
    '--disable-gpu', // Reduces memory usage in headless mode
  ];

  // Only add sandbox flags in CI (Docker/containerized environments)
  if (isCI) {
    chromeArgs.push('--no-sandbox', '--disable-setuid-sandbox');
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
    test: {
      globals: true,
      setupFiles: ['src/test-setup.ts'],
      // Always use browser mode (no jsdom)
      browser: {
        enabled: true,
        instances: [
          {
            browser: 'chromium',
            provider: playwright({
              launchOptions: {
                args: chromeArgs,
              },
            }),
          },
        ],
        headless: true,
        fileParallelism: false,
        slowTestThreshold: 1000,
      },
      testTimeout: 1000,
      hookTimeout: 1000,
      // Retry flaky tests due to browser mode module mocking inconsistencies
      retry: 2,
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
        enabled: true,
        reportsDirectory: '../../coverage/packages/dynamic-forms',
        provider: 'istanbul',
        reporter: ['text', 'html', 'lcov'],
      },
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
