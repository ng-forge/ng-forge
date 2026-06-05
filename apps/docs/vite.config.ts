/// <reference types="vitest" />

import { resolve } from 'node:path';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import analog from '@analogjs/platform';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import * as sass from 'sass';
import { apiDocsPlugin } from './plugins/vite-plugin-api-docs';
import { searchIndexPlugin } from './plugins/vite-plugin-search-index';
import { ogImagePlugin } from './plugins/vite-plugin-og-images';
import { docsMetaPlugin } from './plugins/vite-plugin-docs-meta';

const ADAPTER_NAMES = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/**
 * Shared SCSS compilation helpers used by both the global styles
 * plugin and the per-adapter CSS plugin.
 */
const stylesDir = resolve(__dirname, 'src/styles');
const nodeModules = resolve(__dirname, '../../node_modules');
const scssLoadPaths = [resolve(__dirname, '../../internal/styling/src'), resolve(__dirname, '../../packages'), nodeModules];

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
      // Bootstrap's own SCSS still uses deprecated color fns and @import; we
      // can't edit vendored code, so silence deprecations from dependencies.
      quietDeps: true,
    });
    return inlineCssImports(result.css);
  }

  return {
    name: 'vite-plugin-global-styles',

    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        // Inject render-blocking global CSS link only in dev mode.
        // In production, Vite bundles styles.scss via main.ts import.
        if (ctx.server) {
          return html.replace('</head>', '  <link rel="stylesheet" href="/__global.css" />\n  </head>');
        }
        return html;
      },
    },

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
      quietDeps: true,
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
 * Adapter icon fonts (Material Icons, Bootstrap Icons, PrimeIcons) are served
 * from local npm packages instead of third-party CDNs (Google Fonts / jsDelivr).
 * Loading them from a CDN transmits each visitor's IP to the CDN operator, which
 * is the docs site's only real GDPR exposure; self-hosting removes it.
 *
 * Each entry maps a file inside node_modules to its served path under
 * `fonts/icons/<pkg>/`. The per-package directory layout is preserved so the
 * relative `url()` references inside each CSS resolve to the sibling font files.
 * Only woff2 (+ legacy woff/ttf fallbacks) are shipped; modern browsers fetch
 * woff2 and never request the rest.
 */
const ICON_FONT_ASSETS: ReadonlyArray<readonly [src: string, dest: string]> = [
  ['material-icons/iconfont/material-icons.css', 'fonts/icons/material-icons/material-icons.css'],
  ['material-icons/iconfont/material-icons.woff2', 'fonts/icons/material-icons/material-icons.woff2'],
  ['material-icons/iconfont/material-icons.woff', 'fonts/icons/material-icons/material-icons.woff'],
  ['bootstrap-icons/font/bootstrap-icons.min.css', 'fonts/icons/bootstrap-icons/bootstrap-icons.min.css'],
  ['bootstrap-icons/font/fonts/bootstrap-icons.woff2', 'fonts/icons/bootstrap-icons/fonts/bootstrap-icons.woff2'],
  ['bootstrap-icons/font/fonts/bootstrap-icons.woff', 'fonts/icons/bootstrap-icons/fonts/bootstrap-icons.woff'],
  ['primeicons/primeicons.css', 'fonts/icons/primeicons/primeicons.css'],
  ['primeicons/fonts/primeicons.woff2', 'fonts/icons/primeicons/fonts/primeicons.woff2'],
  ['primeicons/fonts/primeicons.woff', 'fonts/icons/primeicons/fonts/primeicons.woff'],
  ['primeicons/fonts/primeicons.ttf', 'fonts/icons/primeicons/fonts/primeicons.ttf'],
];

const CONTENT_TYPES: Record<string, string> = {
  css: 'text/css',
  woff2: 'font/woff2',
  woff: 'font/woff',
  ttf: 'font/ttf',
};

/**
 * Serves the icon-font assets from node_modules: via middleware in dev, and as
 * emitted assets at build time. Mirrors the adapterCssPlugin pattern.
 */
function iconFontsPlugin(): Plugin {
  return {
    name: 'vite-plugin-icon-fonts',

    configureServer(server) {
      const byDest = new Map(ICON_FONT_ASSETS.map(([src, dest]) => [`/${dest}`, src]));
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        const src = byDest.get(url);
        if (!src) return next();
        try {
          const ext = url.split('.').pop() ?? '';
          res.setHeader('Content-Type', CONTENT_TYPES[ext] ?? 'application/octet-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(readFileSync(resolve(nodeModules, src)));
        } catch (err) {
          console.error(`[icon-fonts] Failed to serve ${url}:`, err);
          res.statusCode = 404;
          res.end();
        }
      });
    },

    generateBundle() {
      for (const [src, dest] of ICON_FONT_ASSETS) {
        try {
          this.emitFile({ type: 'asset', fileName: dest, source: readFileSync(resolve(nodeModules, src)) });
        } catch (err) {
          console.error(`[icon-fonts] Failed to emit ${dest}:`, err);
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

/**
 * Individual API-reference symbol pages are intentionally NOT prerendered. Search
 * Console shows Google crawls them (via the prerendered api-reference index) but
 * leaves them "Crawled - currently not indexed" — they're auto-generated, thin, and
 * low-value, so prerendering ~400 of them was the bulk of the build's time and
 * memory for zero indexation. They resolve client-side via the SPA fallback and stay
 * discoverable through the index pages, which ARE still prerendered below.
 */
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
  console.log(`[prerender] Generated ${routes.length} routes`);
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
          loadPaths: [resolve(__dirname, '../../internal/styling/src'), resolve(__dirname, '../../packages')],
          quietDeps: true,
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
      iconFontsPlugin(),
      apiDocsPlugin(),
      searchIndexPlugin(),
      ogImagePlugin(),
      docsMetaPlugin(),
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
        // Prerendering 730+ routes with Nitro's default (high) concurrency
        // overruns the 8 GB build container (SIGKILL/OOM). Cap it to the build
        // machine's core count: enough parallelism to use both cores, few enough
        // concurrent renders to stay within the heap cap set in vercel-build.sh.
        nitro: {
          prerender: {
            concurrency: 2,
          },
        },
        prerender: {
          routes: generatePrerenderRoutes(),
        },
        vite: {
          inlineStylesExtension: 'scss',
          stylePreprocessorOptions: {
            includePaths: [resolve(__dirname, '../../internal/styling/src'), resolve(__dirname, '../../packages')],
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
