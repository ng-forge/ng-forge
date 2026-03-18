import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { of } from 'rxjs';

/**
 * Server-side HTTP interceptor that reads content files from the filesystem
 * during SSR pre-rendering. Without this, relative URLs like `/content/getting-started.md`
 * fail because there's no HTTP server during the build phase.
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
        body: relativePath.endsWith('.json') ? JSON.parse(content) : content,
      }),
    );
  } catch {
    return next(req);
  }
};

function getDirname(): string {
  return fileURLToPath(new URL('.', import.meta.url));
}
