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
    // No `include` override: vitest's default picks up every `*.{test,spec}.*`
    // under the project root. An enumerated directory list silently drops specs
    // added in a directory nobody remembered to list here.
    reporters: ['default'],
    coverage: {
      enabled: true,
      reportsDirectory: '../../coverage/internal/dynamic-forms-validation',
      provider: 'v8' as const,
      reporter: ['text', 'html', 'lcov'],
    },
  },
}));
