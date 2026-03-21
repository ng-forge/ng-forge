import { inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { APP_BASE_HREF, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, switchMap, catchError, of, shareReplay, tap, from, concat } from 'rxjs';
import { Marked, type Renderer, type Tokens } from 'marked';
import { ShikiService } from '../utils/shiki';
import { decodeHtmlEntities } from '../utils/decode-html-entities';

export interface HeadingEntry {
  id: string;
  text: string;
  level: number;
}

export interface RenderedContent {
  html: SafeHtml;
  /** Raw HTML string before trust-wrapping — used by directives that need the string without re-sanitizing. */
  rawHtml: string;
  /** Page title extracted from frontmatter. */
  title: string;
  /** Page description extracted from frontmatter — used for meta tags. */
  description: string;
  headings: HeadingEntry[];
  error?: string;
}

function slugify(text: string): string {
  // Strip HTML tags iteratively to handle any nested/malformed markup
  let stripped = text.toLowerCase();
  let prev: string;
  do {
    prev = stripped;
    stripped = stripped.replace(/<[^>]*>/g, '');
  } while (stripped !== prev);
  return stripped
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
/** Serializable subset of RenderedContent for TransferState (SafeHtml is not serializable). */
interface TransferableContent {
  rawHtml: string;
  title: string;
  description: string;
  headings: HeadingEntry[];
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly transferState = inject(TransferState);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly baseHref = inject(APP_BASE_HREF, { optional: true }) ?? '/';
  private readonly shiki = inject(ShikiService);
  private readonly cache = new Map<string, Observable<RenderedContent>>();

  /**
   * Load and render markdown content for the given slug.
   * @param slug Path relative to /content/, without .md extension (e.g. 'getting-started')
   */
  load(slug: string): Observable<RenderedContent> {
    const cached = this.cache.get(slug);
    if (cached) return cached;

    // On the client, check TransferState first — allows synchronous emission
    // so the first CD cycle has content and avoids hydration mismatch.
    const stateKey = makeStateKey<TransferableContent>(`doc-content-${slug}`);
    if (this.isBrowser && this.transferState.hasKey(stateKey)) {
      const transferred = this.transferState.get(stateKey, null);
      this.transferState.remove(stateKey);
      if (transferred) {
        const content: RenderedContent = {
          // Safe: rawHtml was produced by our own Marked renderer + Shiki highlighter during SSR,
          // then serialized via TransferState. No user-supplied HTML reaches this path.
          html: this.sanitizer.bypassSecurityTrustHtml(transferred.rawHtml),
          rawHtml: transferred.rawHtml,
          title: transferred.title,
          description: transferred.description,
          headings: transferred.headings,
          error: transferred.error,
        };
        // Emit plain content first (hydration match), then re-highlight code blocks with Shiki.
        const highlighted$ = from(this.reHighlightCodeBlocks(transferred.rawHtml)).pipe(
          switchMap((highlightedHtml) => {
            if (highlightedHtml === transferred.rawHtml) return of(content);
            return of({
              ...content,
              html: this.sanitizer.bypassSecurityTrustHtml(highlightedHtml),
              rawHtml: highlightedHtml,
            });
          }),
        );
        const result$ = concat(of(content), highlighted$).pipe(shareReplay({ bufferSize: 1, refCount: false }));
        this.cache.set(slug, result$);
        return result$;
      }
    }

    const base = this.baseHref.endsWith('/') ? this.baseHref : this.baseHref + '/';
    const result$ = this.http.get(`${base}content/${slug}.md`, { responseType: 'text' }).pipe(
      switchMap(async (markdown) => {
        // Detect SPA fallback: if the response is HTML (not markdown), treat as 404
        const trimmed = markdown.trimStart();
        if (trimmed.startsWith('<!') || trimmed.startsWith('<html')) {
          return {
            html: '',
            rawHtml: '',
            title: '',
            description: '',
            headings: [],
            error: `Content not found: ${slug}`,
          } as RenderedContent;
        }
        // Extract title and description from frontmatter before stripping
        const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
        const fm = fmMatch?.[1] ?? '';
        const unquote = (v: string): string => (/^(['"])(.*)\1$/.test(v) ? v.slice(1, -1) : v);
        const title = unquote(fm.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? '');
        const description = unquote(fm.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? '');
        const stripped = fmMatch ? markdown.slice(fmMatch[0].length) : markdown;
        const rendered = await this.renderMarkdown(stripped);
        return { ...rendered, title, description };
      }),
      // During SSR, store content in TransferState for the client
      tap((content) => {
        if (!this.isBrowser && !content.error) {
          this.transferState.set(stateKey, {
            rawHtml: content.rawHtml,
            title: content.title,
            description: content.description,
            headings: content.headings,
          });
        }
      }),
      catchError((err) => {
        console.warn(`[ContentService] Failed to load /content/${slug}.md`, err);
        return of({
          html: '',
          rawHtml: '',
          title: '',
          description: '',
          headings: [],
          error: `Content not found: ${slug}`,
        } as RenderedContent);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
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
        const html = await this.shiki.highlightCode(token.text, lang);
        highlightedMap.set(key, html);
      }),
    );

    // Pass 2: Render with custom renderer
    const usedIds = new Map<string, number>();
    const renderer: Partial<Renderer> = {
      heading({ text, depth }: Tokens.Heading): string {
        let id = slugify(text);
        const count = usedIds.get(id) ?? 0;
        usedIds.set(id, count + 1);
        if (count > 0) id = `${id}-${count}`;
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
      (_, symbol: string) => `<button type="button" class="api-link" data-api-symbol="${symbol}"><code>${symbol}</code></button>`,
    );

    // Replace emoji indicators with inline SVGs (outside code blocks only)
    html = replaceEmojisOutsideCode(html);

    return {
      // Safe: html is produced by our own Marked renderer + Shiki highlighter from
      // trusted markdown content files shipped with the app. No user input reaches this path.
      html: this.sanitizer.bypassSecurityTrustHtml(html),
      rawHtml: html,
      title: '',
      description: '',
      headings,
    };
  }

  /**
   * Post-hydration: replace plain <pre><code> blocks (from SSR) with Shiki-highlighted versions.
   * Finds all code blocks rendered by the Marked code renderer (wrapped in .code-block-wrapper)
   * and re-highlights them using the client-side Shiki instance.
   */
  private async reHighlightCodeBlocks(html: string): Promise<string> {
    // Match code blocks: <div class="code-block-wrapper">...<pre><code class="language-xxx">CODE</code></pre></div>
    const codeBlockPattern = /<pre><code class="language-([\w-]+)">([\s\S]*?)<\/code><\/pre>/g;
    const matches = [...html.matchAll(codeBlockPattern)];
    if (matches.length === 0) return html;

    let result = html;
    // Process all code blocks in parallel
    const replacements = await Promise.all(
      matches.map(async (match) => {
        const lang = match[1];
        const encoded = match[2];
        const decoded = decodeHtmlEntities(encoded);
        const highlighted = await this.shiki.highlightCode(decoded, lang);
        return { original: match[0], replacement: highlighted };
      }),
    );
    for (const { original, replacement } of replacements) {
      result = result.replace(original, replacement);
    }
    return result;
  }
}
