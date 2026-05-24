/**
 * Build the sitemap.xml content for the docs site.
 *
 * Returns the XML as a string — callers (the docs-meta Vite plugin) are
 * responsible for emitting or serving it. There is no on-disk artifact.
 *
 * `lastmod` values are derived from `git log -1 --format=%cI` per file. The
 * Vercel build environment needs full git history for this to be accurate
 * (the root vercel.json `buildCommand` prepends `git fetch --unshallow`);
 * locally the dev server picks up the working-tree state.
 */
import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE_URL = 'https://ng-forge.com/dynamic-forms';
const DOCS_ROOT = resolve(import.meta.dirname, '..');
const CONTENT_DIR = resolve(DOCS_ROOT, 'public/content');

/**
 * Resolve the last-modified timestamp of a file from git history.
 *
 * Returns full ISO-8601 (`2026-05-22T01:05:14+03:00`). Falls back to
 * current time (`nowISO()`) on git failure or empty output, with a warning.
 * Also exported for the docs-meta plugin's virtual module that derives
 * MIGRATION_GUIDE_META.dateModified the same way.
 */
export function getGitLastmod(filePath: string): string {
  try {
    const date = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: 'utf-8',
    }).trim();
    if (!date) {
      console.warn(`[docs-meta] git log returned empty for ${filePath} — repo may be shallow; using build time as lastmod.`);
      return nowISO();
    }
    return date;
  } catch (err) {
    console.warn(`[docs-meta] git log failed for ${filePath}, using build time as lastmod:`, err);
    return nowISO();
  }
}

function nowISO(): string {
  return new Date().toISOString();
}

function contentFile(slug: string): string {
  return resolve(CONTENT_DIR, `${slug}.md`);
}

interface SitemapEntry {
  slug: string;
  /** Absolute path used to resolve `lastmod` via git. Empty string omits lastmod. */
  filePath: string;
}

function collectEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  // Landing page
  entries.push({ slug: '', filePath: resolve(DOCS_ROOT, 'index.html') });

  // Top-level pages
  entries.push({ slug: 'material/getting-started', filePath: contentFile('getting-started') });
  entries.push({ slug: 'material/feature-overview', filePath: contentFile('feature-overview') });
  entries.push({ slug: 'material/configuration', filePath: contentFile('configuration') });
  entries.push({ slug: 'material/migrating-from-ngx-formly', filePath: contentFile('migrating-from-ngx-formly') });
  entries.push({ slug: 'material/api-driven-forms', filePath: contentFile('api-driven-forms') });
  entries.push({ slug: 'custom/building-an-adapter', filePath: contentFile('building-an-adapter') });

  // Examples — discover from directory
  for (const file of readdirSync(resolve(CONTENT_DIR, 'examples'))
    .filter((f) => f.endsWith('.md'))
    .sort()) {
    const name = file.replace('.md', '');
    entries.push({ slug: `material/examples/${name}`, filePath: resolve(CONTENT_DIR, 'examples', file) });
  }

  // Field types
  for (const page of ['text-inputs', 'selection', 'buttons', 'utility', 'advanced-controls']) {
    entries.push({ slug: `material/field-types/${page}`, filePath: contentFile(`field-types/${page}`) });
  }

  // Validation
  for (const page of ['basics', 'advanced', 'custom-validators', 'reference']) {
    entries.push({ slug: `material/validation/${page}`, filePath: contentFile(`validation/${page}`) });
  }

  // Schema validation
  for (const page of ['overview', 'angular-schema', 'zod']) {
    entries.push({ slug: `material/schema-validation/${page}`, filePath: contentFile(`schema-validation/${page}`) });
  }

  // Dynamic behavior
  for (const page of ['conditional-logic', 'derivation/values', 'derivation/property', 'derivation/async', 'i18n', 'submission']) {
    entries.push({ slug: `material/dynamic-behavior/${page}`, filePath: contentFile(`dynamic-behavior/${page}`) });
  }

  // Layout / prebuilt
  for (const page of [
    'form-groups',
    'form-pages',
    'form-rows',
    'form-arrays/simplified',
    'form-arrays/complete',
    'container-field',
    'hidden-fields',
    'text-components',
  ]) {
    entries.push({ slug: `material/prebuilt/${page}`, filePath: contentFile(`prebuilt/${page}`) });
  }

  // Wrappers
  for (const page of ['overview', 'writing-a-wrapper', 'registering-and-applying']) {
    entries.push({ slug: `material/wrappers/${page}`, filePath: contentFile(`wrappers/${page}`) });
  }

  // Recipes
  for (const page of ['custom-fields', 'expression-parser', 'type-safety', 'events', 'value-exclusion']) {
    entries.push({ slug: `material/recipes/${page}`, filePath: contentFile(`recipes/${page}`) });
  }

  // AI integration / OpenAPI generator
  entries.push({ slug: 'material/ai-integration', filePath: contentFile('ai-integration') });
  entries.push({ slug: 'material/openapi-generator', filePath: contentFile('openapi-generator') });

  // API reference — content is generated at build time from packages/* sources,
  // so there's no single content file to derive lastmod from. Omitting <lastmod>
  // is valid per the sitemap spec.
  entries.push({ slug: 'material/api-reference', filePath: '' });

  return entries;
}

export function generateSitemap(): string {
  // Root URL keeps trailing slash to match the canonical link in index.html
  // (https://ng-forge.com/dynamic-forms/); sub-pages stay without a trailing
  // slash to match the per-page canonical written by DocPageComponent.
  const urlEntries = collectEntries()
    .map(({ slug, filePath }) => {
      const loc = slug ? `${BASE_URL}/${slug}` : `${BASE_URL}/`;
      const lastmod = filePath ? `\n    <lastmod>${getGitLastmod(filePath)}</lastmod>` : '';
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}
