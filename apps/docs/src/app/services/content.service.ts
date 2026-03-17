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

const EMOJI_SVG_MAP: Record<string, string> = {
  '✅': `<span class="icon-indicator icon-indicator--check" aria-label="Yes"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>`,
  '✓': `<span class="icon-indicator icon-indicator--check" aria-label="Yes"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>`,
  '✔': `<span class="icon-indicator icon-indicator--check" aria-label="Yes"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>`,
  '❌': `<span class="icon-indicator icon-indicator--cross" aria-label="No"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>`,
  '✗': `<span class="icon-indicator icon-indicator--cross" aria-label="No"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>`,
  '✘': `<span class="icon-indicator icon-indicator--cross" aria-label="No"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>`,
  '🚀': `<span class="icon-indicator icon-indicator--rocket" aria-label="Rocket"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg></span>`,
  '🎯': `<span class="icon-indicator icon-indicator--target" aria-label="Target"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>`,
};

const EMOJI_PATTERN = new RegExp(`(${Object.keys(EMOJI_SVG_MAP).join('|')})`, 'g');

/**
 * Replace emoji characters with inline SVG icons, but only in text content —
 * not inside code blocks, HTML tags, or attribute values.
 */
function replaceEmojisOutsideCode(html: string): string {
  // Split into: HTML tags (including attributes) and code blocks vs text content.
  // Capture groups: code blocks OR any HTML tag — only replace in non-captured segments.
  const parts = html.split(/(<(?:pre|code)[^>]*>[\s\S]*?<\/(?:pre|code)>|<[^>]+>)/gi);
  for (let i = 0; i < parts.length; i++) {
    // Only replace in text segments (odd indices are captured tags/code blocks)
    if (i % 2 === 0) {
      parts[i] = parts[i].replace(EMOJI_PATTERN, (match) => EMOJI_SVG_MAP[match] ?? match);
    }
  }
  return parts.join('');
}

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
    let html = await marked.parse(markdown);

    // Replace {@link SymbolName} with API reference links.
    // Uses data-api-link attribute so the adapter prefix can be resolved at click time.
    html = html.replace(
      /\{@link\s+(\w+)\}/g,
      (_, symbol: string) => `<a class="api-link" data-api-symbol="${symbol}" href="javascript:void(0)"><code>${symbol}</code></a>`,
    );

    // Replace emoji indicators with inline SVGs (outside code blocks only)
    html = replaceEmojisOutsideCode(html);

    return {
      html: this.sanitizer.bypassSecurityTrustHtml(html),
      headings,
    };
  }
}
