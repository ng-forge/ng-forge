/// <reference types="vitest" />

import { resolve } from 'node:path';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import analog from '@analogjs/platform';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as sass from 'sass';
import { apiDocsPlugin } from './plugins/vite-plugin-api-docs';

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

/**
 * Recursively collect all .md files in a directory and return their slugs.
 * e.g., 'getting-started.md' → 'getting-started'
 *       'validation/basics.md' → 'validation/basics'
 */
function collectContentSlugs(dir: string, base: string = dir): string[] {
  const slugs: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = resolve(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        slugs.push(...collectContentSlugs(fullPath, base));
      } else if (entry.endsWith('.md')) {
        const rel = fullPath.substring(base.length + 1);
        slugs.push(rel.replace(/\.md$/, ''));
      }
    }
  } catch {
    // Content directory may not exist during certain build phases
  }
  return slugs;
}

const PRERENDER_ADAPTERS = ['material', 'bootstrap', 'primeng', 'ionic', 'custom'];
const contentSlugs = collectContentSlugs(resolve(__dirname, 'public/content'));

function generatePrerenderRoutes(): string[] {
  const routes: string[] = ['/'];
  for (const adapter of PRERENDER_ADAPTERS) {
    routes.push(`/${adapter}/getting-started`);
    routes.push(`/${adapter}/examples`);
    routes.push(`/${adapter}/api-reference`);
    for (const slug of contentSlugs) {
      routes.push(`/${adapter}/${slug}`);
    }
  }
  return routes;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    root: __dirname,
    base: mode === 'production' ? '/dynamic-forms/' : '/',
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
      apiDocsPlugin(),
      analog({
        ssr: true,
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
          routes: generatePrerenderRoutes(),
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
      noExternal: [],
      external: [
        'front-matter',
        // Sandbox adapters and examples are client-only (live demos).
        // Excluding from SSR bundle reduces build memory by ~3MB.
        '@ng-forge/examples-material',
        '@ng-forge/examples-bootstrap',
        '@ng-forge/examples-primeng',
        '@ng-forge/examples-ionic',
        '@ng-forge/sandbox-adapter-material',
        '@ng-forge/sandbox-adapter-bootstrap',
        '@ng-forge/sandbox-adapter-primeng',
        '@ng-forge/sandbox-adapter-ionic',
        '@ng-forge/dynamic-forms-primeng',
        '@ng-forge/dynamic-forms-ionic',
        '@ng-forge/dynamic-forms-bootstrap',
        '@ionic/angular',
        'primeng',
      ],
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
      passWithNoTests: true,
      reporters: ['default'],
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
