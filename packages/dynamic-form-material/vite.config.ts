/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig(({ mode }) => ({
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
              args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
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
      reportsDirectory: '../../coverage/packages/dynamic-form-material',
      provider: 'v8',
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
