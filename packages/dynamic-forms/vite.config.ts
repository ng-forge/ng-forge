/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig(({ mode }) => {
  // Conditionally add --no-sandbox only in CI environments
  const isCI = process.env.CI === 'true';
  // Check for browser mode via CLI or ENV - CLI takes precedence to bypass vitest env bug
  const useBrowserMode = process.env.VITEST_BROWSER === 'true';
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
      environment: useBrowserMode ? undefined : 'jsdom',
      browser: {
        enabled: useBrowserMode,
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
        fileParallelism: true,
        slowTestThreshold: 1000,
      },
      testTimeout: 1000,
      hookTimeout: 1000,
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
