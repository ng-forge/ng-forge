import { execSync } from 'child_process';
import { readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'https://ng-forge.com/dynamic-forms';
const DOCS_ROOT = resolve(import.meta.dirname, '..');
const CONTENT_DIR = resolve(DOCS_ROOT, 'public/content');
const OUTPUT_PATH = resolve(DOCS_ROOT, 'public/sitemap.xml');

function getGitLastmod(filePath: string): string {
  try {
    const date = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: 'utf-8',
    }).trim();
    return date || todayISO();
  } catch {
    return todayISO();
  }
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function contentFile(slug: string): string {
  return resolve(CONTENT_DIR, `${slug}.md`);
}

interface SitemapEntry {
  slug: string;
  filePath: string;
}

// Build the full list of pages
const entries: SitemapEntry[] = [];

// Landing page
entries.push({
  slug: '',
  filePath: resolve(DOCS_ROOT, 'index.html'),
});

// Getting started & configuration
entries.push({ slug: 'material/getting-started', filePath: contentFile('getting-started') });
entries.push({ slug: 'material/configuration', filePath: contentFile('configuration') });

// Building an adapter (custom adapter, not material)
entries.push({ slug: 'custom/building-an-adapter', filePath: contentFile('building-an-adapter') });

// Examples — discover from directory
const exampleFiles = readdirSync(resolve(CONTENT_DIR, 'examples'))
  .filter((f) => f.endsWith('.md'))
  .sort();
for (const file of exampleFiles) {
  const name = file.replace('.md', '');
  entries.push({
    slug: `material/examples/${name}`,
    filePath: resolve(CONTENT_DIR, 'examples', file),
  });
}

// Field types
for (const page of ['text-inputs', 'selection', 'buttons', 'utility', 'advanced-controls']) {
  entries.push({
    slug: `material/field-types/${page}`,
    filePath: contentFile(`field-types/${page}`),
  });
}

// Validation
for (const page of ['basics', 'advanced', 'custom-validators', 'reference']) {
  entries.push({
    slug: `material/validation/${page}`,
    filePath: contentFile(`validation/${page}`),
  });
}

// Schema validation
for (const page of ['overview', 'angular-schema', 'zod']) {
  entries.push({
    slug: `material/schema-validation/${page}`,
    filePath: contentFile(`schema-validation/${page}`),
  });
}

// Dynamic behavior
for (const page of ['conditional-logic', 'derivation/values', 'derivation/property', 'derivation/async', 'i18n', 'submission']) {
  entries.push({
    slug: `material/dynamic-behavior/${page}`,
    filePath: contentFile(`dynamic-behavior/${page}`),
  });
}

// Layout / prebuilt
for (const page of [
  'form-groups',
  'form-pages',
  'form-rows',
  'form-arrays/simplified',
  'form-arrays/complete',
  'hidden-fields',
  'text-components',
]) {
  entries.push({
    slug: `material/prebuilt/${page}`,
    filePath: contentFile(`prebuilt/${page}`),
  });
}

// Recipes
for (const page of ['custom-fields', 'expression-parser', 'type-safety', 'events', 'value-exclusion']) {
  entries.push({
    slug: `material/recipes/${page}`,
    filePath: contentFile(`recipes/${page}`),
  });
}

// AI integration
entries.push({ slug: 'material/ai-integration', filePath: contentFile('ai-integration') });

// API reference (no content file — use today's date)
entries.push({ slug: 'material/api-reference', filePath: '' });

// Generate XML
const urlEntries = entries
  .map(({ slug, filePath }) => {
    const loc = slug ? `${BASE_URL}/${slug}` : BASE_URL;
    const lastmod = filePath ? getGitLastmod(filePath) : todayISO();
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

writeFileSync(OUTPUT_PATH, xml, 'utf-8');
console.log(`Sitemap written to ${OUTPUT_PATH} (${entries.length} URLs)`);
