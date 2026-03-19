/// <reference types="vitest" />

import { resolve } from 'node:path';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import analog from '@analogjs/platform';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as sass from 'sass';
import { apiDocsPlugin } from './plugins/vite-plugin-api-docs';
import { searchIndexPlugin } from './plugins/vite-plugin-search-index';

const ADAPTER_NAMES = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/**
 * Shared SCSS compilation helpers used by both the global styles
 * plugin and the per-adapter CSS plugin.
 */
const stylesDir = resolve(__dirname, 'src/styles');
const nodeModules = resolve(__dirname, '../../node_modules');
const scssLoadPaths = [resolve(__dirname, '../../internal/styling/src'), nodeModules];

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
      console.warn(`[css-plugin] Could not inline @import "${importPath}"`);
      return _match;
    }
  });
}

/**
 * Vite plugin that serves the global styles.scss as a proper CSS file
 * (text/css) so it can be loaded via a render-blocking <link> tag.
 * In Vite dev mode, SCSS imports are served as JavaScript modules which
 * makes them non-blocking — this plugin bypasses that behavior.
 */
function globalStylesPlugin(): Plugin {
  const globalStylesPath = resolve(__dirname, 'src/styles.scss');

  function compileGlobalStyles(): string {
    const result = sass.compile(globalStylesPath, {
      loadPaths: scssLoadPaths,
      style: 'compressed',
    });
    return inlineCssImports(result.css);
  }

  return {
    name: 'vite-plugin-global-styles',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/__global.css') return next();
        try {
          const css = compileGlobalStyles();
          res.setHeader('Content-Type', 'text/css');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(css);
        } catch (err) {
          console.error('[global-styles] Failed to compile styles.scss:', err);
          res.statusCode = 500;
          res.end('/* Error compiling styles.scss */');
        }
      });
    },

    // Build: Vite already bundles styles.scss via main.ts import, so no generateBundle needed.
  };
}

/**
 * Vite plugin that compiles adapter SCSS files to CSS and serves them
 * as standalone files. In dev mode they're served via middleware; in
 * build mode they're emitted as assets in the output directory.
 */
function adapterCssPlugin(): Plugin {
  function compileAdapter(name: string): string {
    const filePath = resolve(stylesDir, `adapter-${name}.scss`);
    const result = sass.compile(filePath, {
      loadPaths: scssLoadPaths,
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
      // When a non-route request (e.g., /.well-known/foo.json from Chrome DevTools)
      // hits the Analog SSR fallback, Vite serves index.html and extracts inline
      // <style> tags as proxy modules. The proxy module ID retains the original URL,
      // so if it contains ".json", vite:json tries to parse the CSS as JSON and crashes.
      //
      // Two-layer fix:
      // 1. Middleware: intercept non-route requests before the SSR fallback
      // 2. Load hook: if a .json html-proxy module still gets created, feed vite:json
      //    valid JSON so it doesn't crash parsing CSS
      {
        name: 'vite-plugin-ssr-fallback-guard',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url?.split('?')[0] ?? '';
            // Dot-prefixed paths (/.well-known, /.hidden) are never app routes
            if (/^\/\./.test(url)) {
              res.statusCode = 404;
              res.end();
              return;
            }
            next();
          });
        },
        load(id: string) {
          // Fallback: if a .json html-proxy virtual module was created despite
          // the middleware, return valid JSON so vite:json parses it harmlessly.
          if (id.includes('html-proxy') && /\.json[?#]/.test(id)) {
            return '{}';
          }
        },
      },
      globalStylesPlugin(),
      adapterCssPlugin(),
      apiDocsPlugin(),
      searchIndexPlugin(),
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
