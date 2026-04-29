import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { of } from 'rxjs';

/**
 * Server-side HTTP interceptor that reads content files from the filesystem
 * during SSR pre-rendering. Without this, relative URLs like `/content/getting-started.md`
 * fail because there's no HTTP server during the build phase.
 *
 * Resolution order tries every plausible build/source layout (Analog Nitro prerender
 * bundles into `dist/apps/docs/analog/server/chunks/...` so relative paths from this
 * file are unpredictable). Without a hit, prerender silently produces empty content
 * pages — log loudly when that happens to make Vercel build issues visible.
 *
 * Only registered in `app.config.server.ts` — never in the browser bundle.
 */
export const ssrContentInterceptor: HttpInterceptorFn = (req, next) => {
  const contentMatch = req.url.match(/(?:^|\/)content\/(.+)$/);
  if (!contentMatch) {
    return next(req);
  }

  const relativePath = contentMatch[1];

  try {
    const contentDir = resolveContentDir();
    if (!contentDir) {
      logMissOnce(req.url);
      return next(req);
    }

    const filePath = join(contentDir, relativePath);

    if (!filePath.startsWith(contentDir)) {
      return next(req);
    }

    const content = readFileSync(filePath, 'utf-8');
    return of(
      new HttpResponse({
        status: 200,
        body: relativePath.endsWith('.json') ? JSON.parse(content) : content,
      }),
    );
  } catch (err) {
    if (process.env['DEBUG_SSR_CONTENT']) {
      console.warn(`[ssr-content] Failed to read ${relativePath}:`, (err as Error).message);
    }
    return next(req);
  }
};

const MAX_WALK_UP_LEVELS = 8;

let resolvedContentDir: string | null | undefined;
let missLogged = false;

function logMissOnce(url: string): void {
  if (missLogged) return;
  missLogged = true;
  console.warn(
    `[ssr-content] No content directory found during SSR — prerender will produce empty content pages.\n` +
      `  Triggering URL: ${url}\n` +
      `  Set DEBUG_SSR_CONTENT=1 for per-request diagnostics.\n` +
      `  Searched candidates:\n${candidatePaths()
        .map((p) => `    - ${p}`)
        .join('\n')}`,
  );
}

function candidatePaths(): string[] {
  const dirName = import.meta.dirname ?? getDirname();
  const cwd = process.cwd();

  // Walk up from the bundled file location looking for known content dir layouts.
  const walkUp: string[] = [];
  let current = dirName;
  for (let i = 0; i < MAX_WALK_UP_LEVELS; i++) {
    walkUp.push(
      join(current, 'content'),
      join(current, 'public', 'content'),
      join(current, 'client', 'content'),
      join(current, 'analog', 'public', 'content'),
    );
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return [
    ...walkUp,
    // Workspace-root absolute fallbacks — Vercel and Nx both run with cwd at repo root.
    resolve(cwd, 'apps', 'docs', 'public', 'content'),
    resolve(cwd, 'dist', 'apps', 'docs', 'analog', 'public', 'content'),
    resolve(cwd, 'dist', 'apps', 'docs', 'client', 'content'),
  ];
}

function resolveContentDir(): string | null {
  if (resolvedContentDir !== undefined) return resolvedContentDir;

  const candidates = candidatePaths();
  resolvedContentDir = candidates.find((dir) => existsSync(dir)) ?? null;

  if (resolvedContentDir && process.env['DEBUG_SSR_CONTENT']) {
    console.log(`[ssr-content] Resolved content dir: ${resolvedContentDir}`);
  }

  return resolvedContentDir;
}

function getDirname(): string {
  return fileURLToPath(new URL('.', import.meta.url));
}
