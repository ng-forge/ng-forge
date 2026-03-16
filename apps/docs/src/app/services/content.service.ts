import { inject, Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ContentRenderer } from '@analogjs/content';
import { Observable, map, switchMap, catchError, of, from, shareReplay } from 'rxjs';

export interface RenderedContent {
  html: string;
  error?: string;
}

/**
 * Fetches markdown files from the /content/ directory and renders them
 * through Analog's ContentRenderer (marked + Shiki).
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly renderer = inject(ContentRenderer);
  private readonly baseHref = inject(APP_BASE_HREF, { optional: true }) ?? '/';
  private readonly cache = new Map<string, Observable<RenderedContent>>();

  /**
   * Load and render markdown content for the given slug.
   * @param slug Path relative to /content/, without .md extension (e.g. 'getting-started')
   */
  load(slug: string): Observable<RenderedContent> {
    const cached = this.cache.get(slug);
    if (cached) return cached;

    const base = this.baseHref.endsWith('/') ? this.baseHref : this.baseHref + '/';
    const result$ = this.http.get(`${base}content/${slug}.md`, { responseType: 'text' }).pipe(
      switchMap((markdown) => from(this.renderer.render(markdown))),
      map((html) => ({ html }) as RenderedContent),
      catchError((err) => {
        console.warn(`[ContentService] Failed to load /content/${slug}.md`, err);
        return of({ html: '', error: `Content not found: ${slug}` } as RenderedContent);
      }),
      shareReplay(1),
    );

    this.cache.set(slug, result$);
    return result$;
  }
}
