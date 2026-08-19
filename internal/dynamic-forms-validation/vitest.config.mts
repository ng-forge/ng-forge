import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/internal/dynamic-forms-validation',
  plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  test: {
    name: 'dynamic-forms-validation',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests,material,bootstrap,primeng,ionic,validate,discovery,reporting}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      enabled: true,
      reportsDirectory: '../../coverage/internal/dynamic-forms-validation',
      provider: 'v8' as const,
      reporter: ['text', 'html', 'lcov'],
    },
  },
}));
