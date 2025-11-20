/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig(({ mode }) => {
  const isCI = process.env.CI === 'true';
  const chromeArgs = [
    '--disable-dev-shm-usage', // Prevents shared memory issues in containers
    '--disable-gpu', // Reduces memory usage in headless mode
    '--no-sandbox', // Required for containerized environments
    '--disable-setuid-sandbox', // Required for containerized environments
    '--single-process', // Run browser in single process mode
    '--disable-web-security', // Disable web security for testing
    '--disable-features=IsolateOrigins,site-per-process', // Reduce resource usage
  ];

  // Only add additional flags in CI
  if (isCI) {
    chromeArgs.push('--disable-features=VizDisplayCompositor');
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
      browser: {
        enabled: true,
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
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
