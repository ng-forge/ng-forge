/// <reference types="vitest" />

import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import analog from '@analogjs/platform';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as sass from 'sass';

const ADAPTER_NAMES = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/**
 * Vite plugin that compiles adapter SCSS files to CSS and serves them
 * as standalone files. In dev mode they're served via middleware; in
 * build mode they're emitted as assets in the output directory.
 */
function adapterCssPlugin(): Plugin {
  const stylesDir = resolve(__dirname, 'src/styles');
  const nodeModules = resolve(__dirname, '../../node_modules');
  const loadPaths = [resolve(__dirname, '../../internal/styling/src'), nodeModules];

  /**
   * Sass passes through `@import` of `.css` files as native CSS imports.
   * The browser can't resolve bare specifiers like `@ionic/angular/css/core.css`,
   * so we inline them by reading from node_modules.
   */
  function inlineCssImports(css: string): string {
    return css.replace(/@import\s*['"]([^'"]+\.css)['"]\s*;/g, (_match, importPath: string) => {
      try {
        const fullPath = resolve(nodeModules, importPath);
        return readFileSync(fullPath, 'utf-8');
      } catch {
        console.warn(`[adapter-css] Could not inline @import "${importPath}"`);
        return _match;
      }
    });
  }

  function compileAdapter(name: string): string {
    const filePath = resolve(stylesDir, `adapter-${name}.scss`);
    const result = sass.compile(filePath, {
      loadPaths,
      style: 'compressed',
    });
    return inlineCssImports(result.css);
  }

  return {
    name: 'vite-plugin-adapter-css',

    // Dev: serve compiled CSS via middleware
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/(material|bootstrap|primeng|ionic)\.css$/);
        if (!match) return next();

        const adapterName = match[1];
        try {
          const css = compileAdapter(adapterName);
          res.setHeader('Content-Type', 'text/css');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(css);
        } catch (err) {
          console.error(`[adapter-css] Failed to compile ${adapterName}.scss:`, err);
          res.statusCode = 500;
          res.end(`/* Error compiling ${adapterName}.scss */`);
        }
      });
    },

    // Build: emit each adapter CSS as an asset in the output directory
    generateBundle() {
      for (const name of ADAPTER_NAMES) {
        try {
          const css = compileAdapter(name);
          this.emitFile({
            type: 'asset',
            fileName: `${name}.css`,
            source: css,
          });
        } catch (err) {
          console.error(`[adapter-css] Failed to compile ${name}.scss:`, err);
        }
      }
    },
  };
}

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
      adapterCssPlugin(),
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
