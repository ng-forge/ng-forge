/**
 * Shared Shiki highlighting utility.
 *
 * Uses shiki/core with explicit language and theme imports so that only the
 * grammars actually used by the docs are bundled (~6 languages instead of 300+).
 *
 * During SSR pre-rendering, Shiki is skipped to avoid OOM — plain <pre><code>
 * blocks are emitted instead. The client hydrates and applies full syntax
 * highlighting with theme support. SEO crawlers still get the code text.
 *
 * The highlighter instance is cached in an injectable service (not module-level)
 * to remain SSR-safe — each request gets its own injector tree.
 */

import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { HighlighterCore } from 'shiki/core';

function escapeHtml(code: string): string {
  return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function plainCodeBlock(code: string, lang: string): string {
  return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
}

@Injectable({ providedIn: 'root' })
export class ShikiService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private highlighterPromise: Promise<HighlighterCore> | null = null;

  private getHighlighter(): Promise<HighlighterCore> {
    if (!this.highlighterPromise) {
      this.highlighterPromise = (async () => {
        const { createHighlighterCore } = await import('shiki/core');
        const { createOnigurumaEngine } = await import('shiki/engine/oniguruma');

        const langTs = await import('shiki/dist/langs/typescript.mjs');
        const langJson = await import('shiki/dist/langs/json.mjs');
        const langBash = await import('shiki/dist/langs/bash.mjs');
        const langScss = await import('shiki/dist/langs/scss.mjs');
        const langHtml = await import('shiki/dist/langs/html.mjs');
        const langCss = await import('shiki/dist/langs/css.mjs');
        const themeLight = await import('shiki/dist/themes/material-theme-lighter.mjs');
        const themeDark = await import('shiki/dist/themes/material-theme-darker.mjs');

        return createHighlighterCore({
          engine: createOnigurumaEngine(import('shiki/wasm')),
          themes: [themeLight.default, themeDark.default],
          langs: [langTs.default, langJson.default, langBash.default, langScss.default, langHtml.default, langCss.default],
        });
      })();
    }
    return this.highlighterPromise;
  }

  /**
   * Highlight code with dual themes (light + dark).
   * Returns plain code blocks during SSR to avoid Shiki memory overhead.
   */
  async highlightCode(code: string, lang: string): Promise<string> {
    if (!this.isBrowser) {
      return plainCodeBlock(code, lang);
    }
    try {
      const highlighter = await this.getHighlighter();
      const resolvedLang = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
      return highlighter.codeToHtml(code, {
        lang: resolvedLang,
        themes: { light: 'material-theme-lighter', dark: 'material-theme-darker' },
        defaultColor: false,
      });
    } catch (err) {
      console.warn('[Shiki] Failed to highlight code:', err);
      return plainCodeBlock(code, lang);
    }
  }

  /**
   * Highlight inline code — returns just the tokenised inner HTML (without
   * the `<pre><code>` wrapper) so the caller can slot it into an existing
   * `<code>` element. Falls back to HTML-escaped plain text during SSR.
   */
  async highlightInline(code: string, lang: string): Promise<string> {
    if (!this.isBrowser) {
      return escapeHtml(code);
    }
    try {
      const highlighter = await this.getHighlighter();
      const resolvedLang = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
      const fullHtml = highlighter.codeToHtml(code, {
        lang: resolvedLang,
        themes: { light: 'material-theme-lighter', dark: 'material-theme-darker' },
        defaultColor: false,
      });
      const match = fullHtml.match(/<code[^>]*>([\s\S]*?)<\/code>/);
      return match ? match[1].replace(/^<span[^>]*class="line"[^>]*>([\s\S]*?)<\/span>\s*$/, '$1') : escapeHtml(code);
    } catch (err) {
      console.warn('[Shiki] Failed to highlight inline code:', err);
      return escapeHtml(code);
    }
  }

  /**
   * Highlight code with a single theme.
   * Returns plain code blocks during SSR.
   */
  async highlightCodeSingleTheme(code: string, lang: string, theme: string): Promise<string> {
    if (!this.isBrowser) {
      return plainCodeBlock(code, lang);
    }
    try {
      const highlighter = await this.getHighlighter();
      const resolvedLang = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
      return highlighter.codeToHtml(code, { lang: resolvedLang, theme });
    } catch (err) {
      console.warn('[Shiki] Failed to highlight code:', err);
      return plainCodeBlock(code, lang);
    }
  }
}
