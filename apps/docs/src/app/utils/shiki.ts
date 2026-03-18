/**
 * Shared Shiki highlighting utility.
 *
 * During SSR pre-rendering, Shiki is skipped to avoid OOM — plain <pre><code>
 * blocks are emitted instead. The client hydrates and applies full syntax
 * highlighting with theme support. SEO crawlers still get the code text.
 */

const IS_SERVER = typeof window === 'undefined';

/** Cached shiki `codeToHtml` function — avoids re-importing on every call. */
let cachedCodeToHtml: typeof import('shiki').codeToHtml | null = null;

async function getCodeToHtml(): Promise<typeof import('shiki').codeToHtml> {
  if (!cachedCodeToHtml) {
    const shiki = await import('shiki');
    cachedCodeToHtml = shiki.codeToHtml;
  }
  return cachedCodeToHtml;
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
    const codeToHtml = await getCodeToHtml();
    return await codeToHtml(code, {
      lang,
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
    const codeToHtml = await getCodeToHtml();
    return await codeToHtml(code, { lang, theme });
  } catch (err) {
    console.warn('[Shiki] Failed to highlight code:', err);
    return plainCodeBlock(code, lang);
  }
}
