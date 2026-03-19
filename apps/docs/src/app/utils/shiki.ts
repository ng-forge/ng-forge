/**
 * Shared Shiki highlighting utility.
 *
 * Uses shiki/core with explicit language and theme imports so that only the
 * grammars actually used by the docs are bundled (~6 languages instead of 300+).
 *
 * During SSR pre-rendering, Shiki is skipped to avoid OOM — plain <pre><code>
 * blocks are emitted instead. The client hydrates and applies full syntax
 * highlighting with theme support. SEO crawlers still get the code text.
 */

import type { HighlighterCore } from 'shiki/core';

const IS_SERVER = typeof window === 'undefined';

/** Cached highlighter instance — created once, reused for all calls. */
let highlighterPromise: Promise<HighlighterCore> | null = null;

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const { createHighlighterCore } = await import('shiki/core');
      const { createOnigurumaEngine } = await import('shiki/engine/oniguruma');

      // Import only the languages and themes used in docs.
      // These resolve to individual chunks instead of the full 300+ grammar bundle.
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
  return highlighterPromise;
}

function escapeHtml(code: string): string {
  return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function plainCodeBlock(code: string, lang: string): string {
  return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`;
}

/**
 * Highlight code with dual themes (light + dark).
 * Returns plain code blocks during SSR to avoid Shiki memory overhead.
 */
export async function highlightCode(code: string, lang: string): Promise<string> {
  if (IS_SERVER) {
    return plainCodeBlock(code, lang);
  }
  try {
    const highlighter = await getHighlighter();
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
 * Highlight code with a single theme.
 * Returns plain code blocks during SSR.
 */
export async function highlightCodeSingleTheme(code: string, lang: string, theme: string): Promise<string> {
  if (IS_SERVER) {
    return plainCodeBlock(code, lang);
  }
  try {
    const highlighter = await getHighlighter();
    const resolvedLang = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
    return highlighter.codeToHtml(code, { lang: resolvedLang, theme });
  } catch (err) {
    console.warn('[Shiki] Failed to highlight code:', err);
    return plainCodeBlock(code, lang);
  }
}
