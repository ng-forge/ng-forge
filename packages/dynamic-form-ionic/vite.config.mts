/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/dynamic-form-ionic',
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    name: 'dynamic-form-ionic',
    watch: false,
    globals: true,
    browser: {
      enabled: true,
      instances: [
        { browser: 'chromium', provider: playwright() }
      ],
      headless: true,
    },
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/dynamic-form-ionic',
      provider: 'v8' as const,
    },
    server: {
      deps: {
        inline: ['@ionic/core', '@ionic/angular'],
      },
    },
  },
}));
