import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { of } from 'rxjs';

/**
 * Server-side HTTP interceptor that reads content files from the filesystem
 * during SSR pre-rendering. Without this, relative URLs like `/content/getting-started.md`
 * fail because there's no HTTP server during the build phase.
 *
 * Tries multiple content directory locations to handle different build environments:
 * - Alongside the SSR bundle (production server)
 * - In the sibling client output directory (Analog build structure)
 * - In the source tree (Nx prerendering from workspace root)
 *
 * Only registered in `app.config.server.ts` — never in the browser bundle.
 */
export const ssrContentInterceptor: HttpInterceptorFn = (req, next) => {
  // Intercept content markdown and API JSON requests
  const contentMatch = req.url.match(/(?:^|\/)content\/(.+)$/);
  if (!contentMatch) {
    return next(req);
  }

  const relativePath = contentMatch[1];

  try {
    const contentDir = resolveContentDir();
    if (!contentDir) return next(req);

    const filePath = join(contentDir, relativePath);

    // Prevent path traversal
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
  } catch {
    return next(req);
  }
};

/** Cached content directory path — resolved once per build-time pre-render process (not shared across SSR requests). */
let resolvedContentDir: string | null | undefined;

function resolveContentDir(): string | null {
  if (resolvedContentDir !== undefined) return resolvedContentDir;

  const dirName = import.meta.dirname ?? getDirname();
  const candidates = [
    resolve(dirName, 'content'),
    resolve(dirName, '..', 'client', 'content'),
    resolve(dirName, '..', 'public', 'content'),
    resolve(process.cwd(), 'apps', 'docs', 'public', 'content'),
  ];

  resolvedContentDir = candidates.find((dir) => existsSync(dir)) ?? null;
  return resolvedContentDir;
}

function getDirname(): string {
  return fileURLToPath(new URL('.', import.meta.url));
}
