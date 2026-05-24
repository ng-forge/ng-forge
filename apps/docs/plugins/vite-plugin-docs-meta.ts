/**
 * Generates /sitemap.xml and /llms-full.txt at build / serve time so they
 * are never committed to the repo and never drift from content.
 *
 * - `configureServer`: dev middleware regenerates on each request so local
 *   navigation always sees current working-tree state.
 * - `generateBundle`: emits both files into the production bundle so they
 *   ship as static assets in dist/apps/docs/client.
 * - Also exposes a virtual module `virtual:docs-meta/migration-modified`
 *   carrying the git-derived dateModified of the migration guide markdown.
 *   feature-overview.data.ts reads from it instead of hand-maintaining
 *   the date in TypeScript.
 *
 * Sitemap `lastmod` values come from `git log -1 --format=%cI`; the Vercel
 * build environment needs full history for this — see `vercel.json`.
 */
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { generateSitemap, getGitLastmod } from '../scripts/generate-sitemap';
import { generateLlmsFull } from '../scripts/generate-llms-full';

const VIRTUAL_MIGRATION_MODIFIED = 'virtual:docs-meta/migration-modified';
// Vite convention: prefix resolved virtual ids with NUL so the loader
// doesn't try to read them from disk.
const RESOLVED_VIRTUAL_MIGRATION_MODIFIED = '\0' + VIRTUAL_MIGRATION_MODIFIED;

const MIGRATION_GUIDE_FILE = resolve(import.meta.dirname, '..', 'public', 'content', 'migrating-from-ngx-formly.md');

/** Strip the time + zone from an ISO 8601 datetime, keeping `YYYY-MM-DD`. */
function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export function docsMetaPlugin(): Plugin {
  return {
    name: 'vite-plugin-docs-meta',

    resolveId(id) {
      if (id === VIRTUAL_MIGRATION_MODIFIED) return RESOLVED_VIRTUAL_MIGRATION_MODIFIED;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MIGRATION_MODIFIED) {
        const dateModified = dateOnly(getGitLastmod(MIGRATION_GUIDE_FILE));
        return `export const MIGRATION_GUIDE_DATE_MODIFIED = ${JSON.stringify(dateModified)};\n`;
      }
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Strip the query string so `/sitemap.xml?nocache=1` still matches.
        const path = req.url?.split('?')[0];
        try {
          if (path === '/sitemap.xml') {
            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(generateSitemap());
            return;
          }
          if (path === '/llms-full.txt') {
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
