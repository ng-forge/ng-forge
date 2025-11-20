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
      testTimeout: 30000,
      hookTimeout: 30000,
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/packages/dynamic-form-primeng',
        provider: 'istanbul',
        reporter: ['text', 'html', 'lcov'],
      },
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
