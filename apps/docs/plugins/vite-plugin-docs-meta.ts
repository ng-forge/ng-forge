/**
 * Generates /sitemap.xml and /llms-full.txt at build / serve time so they
 * are never committed to the repo and never drift from content.
 *
 * - `configureServer`: dev middleware regenerates on each request so local
 *   navigation always sees current working-tree state.
 * - `generateBundle`: emits both files into the production bundle so they
 *   ship as static assets in dist/apps/docs/client.
 *
 * Sitemap `lastmod` values come from `git log -1 --format=%cI`; the Vercel
 * build environment needs full history for this — see `vercel.json`.
 */
import type { Plugin } from 'vite';
import { generateSitemap } from '../scripts/generate-sitemap';
import { generateLlmsFull } from '../scripts/generate-llms-full';

export function docsMetaPlugin(): Plugin {
  return {
    name: 'vite-plugin-docs-meta',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          if (req.url === '/sitemap.xml') {
            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(generateSitemap());
            return;
          }
          if (req.url === '/llms-full.txt') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(generateLlmsFull());
            return;
          }
        } catch (err) {
          console.error('[docs-meta] Failed to generate:', err);
          res.statusCode = 500;
          res.end(`/* docs-meta error: ${(err as Error).message} */`);
          return;
        }
        next();
      });
    },

    generateBundle() {
      try {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: generateSitemap() });
        this.emitFile({ type: 'asset', fileName: 'llms-full.txt', source: generateLlmsFull() });
      } catch (err) {
        this.error(`[docs-meta] Failed to emit: ${(err as Error).message}`);
      }
    },
  };
}
