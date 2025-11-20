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
      instances: [{ browser: 'chromium', provider: playwright() }],
      headless: true,
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/dynamic-form',
      provider: 'v8',
    },
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
