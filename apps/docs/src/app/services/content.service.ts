import { inject, Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, switchMap, catchError, of, shareReplay } from 'rxjs';
import { Marked, type Renderer, type Tokens } from 'marked';
import { codeToHtml } from 'shiki';

export interface HeadingEntry {
  id: string;
  text: string;
  level: number;
}

export interface RenderedContent {
  html: SafeHtml;
  headings: HeadingEntry[];
  error?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const CALLOUT_PREFIXES: Record<string, string> = {
  '[!NOTE]': 'info',
  '[!TIP]': 'tip',
  '[!WARNING]': 'warning',
  '[!DANGER]': 'danger',
  '[!INFO]': 'info',
  '[!IMPORTANT]': 'warning',
  '[!CAUTION]': 'danger',
};

/**
 * Fetches markdown files from the /content/ directory and renders them
 * with Shiki syntax highlighting (two-pass: lex → highlight → render).
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
        // Strip YAML frontmatter (---\n...\n---)
        const stripped = markdown.replace(/^---\n[\s\S]*?\n---\n?/, '');
        return this.renderMarkdown(stripped);
      }),
      catchError((err) => {
        console.warn(`[ContentService] Failed to load /content/${slug}.md`, err);
        return of({ html: '', headings: [], error: `Content not found: ${slug}` } as RenderedContent);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.cache.set(slug, result$);
    return result$;
  }

  private async renderMarkdown(markdown: string): Promise<RenderedContent> {
    const headings: HeadingEntry[] = [];

    // Pass 1: Lex markdown, extract code tokens, highlight with shiki
    const lexer = new Marked();
    const tokens = lexer.lexer(markdown);
    const codeTokens: Tokens.Code[] = [];

    const walkTokens = (tokenList: Tokens.Generic[]): void => {
      for (const token of tokenList) {
        if (token.type === 'code') {
          codeTokens.push(token as Tokens.Code);
        }
      }
    };
    walkTokens(tokens as Tokens.Generic[]);

    // Highlight all code blocks in parallel
    const highlightedMap = new Map<string, string>();
    await Promise.all(
      codeTokens.map(async (token) => {
        // Strip metadata from language tag (e.g. "typescript name="app.config.ts"" → "typescript")
        const lang = (token.lang ?? '').split(/\s+/)[0] || 'text';
        const key = `${lang}:${token.text}`;
        if (highlightedMap.has(key)) return;
        try {
          const html = await codeToHtml(token.text, {
            lang,
            themes: { light: 'material-theme-lighter', dark: 'material-theme-darker' },
            defaultColor: false,
          });
          highlightedMap.set(key, html);
        } catch {
          // Fallback: plain code block
          const escaped = token.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          highlightedMap.set(key, `<pre><code>${escaped}</code></pre>`);
        }
      }),
    );

    // Pass 2: Render with custom renderer
    const renderer: Partial<Renderer> = {
      heading({ text, depth }: Tokens.Heading): string {
        const id = slugify(text);
        if (depth === 2 || depth === 3) {
          headings.push({ id, text, level: depth });
        }
        const anchor =
          depth >= 2
            ? `<button class="heading-anchor" data-anchor-id="${id}" type="button" aria-label="Copy link to ${text}" title="Copy to clipboard">` +
              `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
              `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>` +
              `<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>` +
              `</svg></button>`
            : '';
        return `<h${depth} id="${id}">${text}${anchor}</h${depth}>`;
      },
      code({ text, lang: rawLang }: Tokens.Code): string {
        const lang = (rawLang ?? '').split(/\s+/)[0] || 'text';
        const key = `${lang}:${text}`;
        const highlighted = highlightedMap.get(key);
        const codeHtml =
          highlighted ??
          `<pre><code class="language-${lang || 'text'}">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        return (
          `<div class="code-block-wrapper">` +
          `<button class="code-copy-btn" type="button" data-code="${escaped}" aria-label="Copy code">` +
          `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
          `<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>` +
          `</svg></button>` +
          codeHtml +
          `</div>`
        );
      },
      blockquote(this: { parser: { parse(tokens: Tokens.Generic[]): string } }, token: Tokens.Blockquote): string {
        const body = this.parser.parse(token.tokens);
        // Check for GitHub-style callouts
        for (const [prefix, cssClass] of Object.entries(CALLOUT_PREFIXES)) {
          if (body.includes(prefix)) {
            const cleaned = body.replace(prefix, '').trim();
            return `<blockquote class="callout--${cssClass}">${cleaned}</blockquote>`;
          }
        }
        return `<blockquote>${body}</blockquote>`;
      },
    };

    const marked = new Marked({ renderer });
    const html = await marked.parse(markdown);

    return {
      html: this.sanitizer.bypassSecurityTrustHtml(html),
      headings,
    };
  }
}
