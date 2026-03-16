/// <reference types="vitest" />

import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite',
    build: {
      outDir: '../../dist/apps/docs/client',
      reportCompressedSize: true,
      target: ['es2020'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [resolve(__dirname, '../../internal/styling/src')],
        },
      },
    },
    plugins: [
      analog({
        ssr: false,
        static: true,
        content: {
          highlighter: 'shiki',
          shikiOptions: {
            highlighter: {
              themes: ['material-theme-lighter', 'material-theme-darker'],
            },
          },
        },
        prerender: {
          routes: [],
        },
        vite: {
          inlineStylesExtension: 'scss',
          stylePreprocessorOptions: {
            includePaths: [resolve(__dirname, '../../internal/styling/src')],
          },
        },
      }),

      nxViteTsPaths(),
    ],
    optimizeDeps: {
      include: ['front-matter'],
      exclude: [],
    },
    ssr: {
      noExternal: ['front-matter'],
    },
    server: {
      fs: {
        allow: ['.', '../../internal', '../../node_modules'],
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.spec.ts'],
      reporters: ['default'],
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
