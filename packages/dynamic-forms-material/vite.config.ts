/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig(({ mode }) => {
  const isCI = process.env.CI === 'true';
  const chromeArgs = ['--disable-dev-shm-usage', '--disable-gpu'];

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
      testTimeout: 2000,
      hookTimeout: 2000,
      retry: 2,
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
        enabled: true,
        reportsDirectory: '../../coverage/packages/dynamic-forms-material',
        provider: 'istanbul',
        reporter: ['text', 'html', 'lcov'],
      },
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
