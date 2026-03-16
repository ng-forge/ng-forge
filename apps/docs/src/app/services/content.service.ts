import { inject, Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, map, switchMap, catchError, of, shareReplay } from 'rxjs';
import { marked } from 'marked';

export interface RenderedContent {
  html: SafeHtml;
  error?: string;
}

/**
 * Fetches markdown files from the /content/ directory and renders them
 * using marked directly.
 * Returns SafeHtml to bypass Angular's HTML sanitizer.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
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
      switchMap(async (markdown) => {
        const html = await marked.parse(markdown);
        return { html: this.sanitizer.bypassSecurityTrustHtml(html) } as RenderedContent;
      }),
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
