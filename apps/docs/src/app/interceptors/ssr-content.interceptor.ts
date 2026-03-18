import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { of } from 'rxjs';

/**
 * Server-side HTTP interceptor that reads content markdown files from the filesystem
 * during SSR/pre-rendering. Without this, relative URLs like `/content/getting-started.md`
 * fail because there's no HTTP server origin during the pre-render build phase.
 *
 * Only registered in `app.config.server.ts` — never included in the browser bundle.
 */
export const ssrContentInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept content markdown requests
  const contentMatch = req.url.match(/(?:^|\/)content\/(.+\.md)$/);
  if (!contentMatch) {
    return next(req);
  }

  const relativePath = contentMatch[1];

  try {
    // Resolve content directory relative to the SSR bundle's location.
    // The content directory is copied alongside the server bundle during build.
    const dirName = import.meta.dirname ?? getDirname();
    const contentDir = resolve(dirName, 'content');
    const filePath = join(contentDir, relativePath);

    // Prevent path traversal
    if (!filePath.startsWith(contentDir)) {
      return next(req);
    }

    const content = readFileSync(filePath, 'utf-8');
    return of(
      new HttpResponse({
        status: 200,
        body: content,
      }),
    );
  } catch {
    // File not found — fall through to normal HTTP
    return next(req);
  }
};

/** Fallback for environments where import.meta.dirname is not available. */
function getDirname(): string {
  return fileURLToPath(new URL('.', import.meta.url));
}
