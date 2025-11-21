/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig(() => {
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
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/dynamic-forms-ionic',
    plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    optimizeDeps: {
      include: ['@vitest/coverage-istanbul'],
    },
    test: {
      name: 'dynamic-forms-ionic',
      watch: false,
      globals: true,
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
      include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      setupFiles: ['src/test-setup.ts'],
      reporters: ['default'],
      coverage: {
        enabled: true,
        reportsDirectory: '../../coverage/packages/dynamic-forms-ionic',
        provider: 'istanbul' as const,
        reporter: ['text', 'html', 'lcov'],
      },
      server: {
        deps: {
          inline: ['@ionic/core', '@ionic/angular'],
        },
      },
    },
  };
});
