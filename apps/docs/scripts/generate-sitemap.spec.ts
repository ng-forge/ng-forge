import { describe, expect, it } from 'vitest';
import { generateSitemap } from './generate-sitemap';

describe('generateSitemap', () => {
  const xml = generateSitemap();

  it('produces a well-formed sitemap document', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('uses a trailing slash for the root URL (matches canonical link in index.html)', () => {
    expect(xml).toContain('<loc>https://ng-forge.com/dynamic-forms/</loc>');
    // Sub-pages must not have trailing slashes (matches per-page canonical).
    expect(xml).not.toContain('<loc>https://ng-forge.com/dynamic-forms/material/getting-started/</loc>');
  });

  it('includes the migration guide under /material/', () => {
    expect(xml).toContain('<loc>https://ng-forge.com/dynamic-forms/material/migrating-from-ngx-formly</loc>');
  });

  it('omits <lastmod> for the api-reference URL (content is build-time-generated)', () => {
    // api-reference appears in the sitemap but its <url> block has no <lastmod> child.
    const apiBlock = xml.match(/<url>\s*<loc>https:\/\/ng-forge\.com\/dynamic-forms\/material\/api-reference<\/loc>\s*<\/url>/);
    expect(apiBlock).not.toBeNull();
  });

  it('is deterministic across consecutive invocations within the same process', () => {
    expect(generateSitemap()).toBe(xml);
  });
});
