import { beforeAll, describe, expect, it, vi } from 'vitest';
import { generateSitemap, getGitLastmod } from './generate-sitemap';

// generateSitemap() shells out to `git log` once per content file (60+ calls),
// so a full run is several seconds of real subprocess I/O and scales with the
// number of docs pages. Give this file headroom over the 5s default so it does
// not flake under parallel test load.
vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 });

describe('generateSitemap', () => {
  let xml: string;

  // Run the generator inside the test lifecycle so an exception (missing
  // content dir, broken git invocation, etc.) surfaces as a named test
  // failure rather than a module-load stack trace.
  beforeAll(() => {
    xml = generateSitemap();
  });

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

  it('includes the addons pages', () => {
    for (const page of ['overview', 'presets-and-actions', 'custom-types']) {
      expect(xml).toContain(`<loc>https://ng-forge.com/dynamic-forms/material/addons/${page}</loc>`);
    }
  });

  it('omits <lastmod> for the api-reference URL (content is build-time-generated)', () => {
    // api-reference appears in the sitemap but its <url> block has no <lastmod> child.
    const apiBlock = xml.match(/<url>\s*<loc>https:\/\/ng-forge\.com\/dynamic-forms\/material\/api-reference<\/loc>\s*<\/url>/);
    expect(apiBlock).not.toBeNull();
  });

  it('normalises all lastmod values to UTC Z form (no mixed timezone offsets)', () => {
    // Every <lastmod> we emit should end with `Z` — git's offset form is converted via toUtcIso().
    const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
    expect(lastmods.length).toBeGreaterThan(0);
    for (const ts of lastmods) {
      expect(ts).toMatch(/Z$/);
    }
  });

  // Note: this only guarantees the factory is in-process pure. Real cross-run
  // stability depends on git history not changing between invocations, which
  // is outside what a unit test can pin down.
  it('produces identical output across two in-process invocations', () => {
    expect(generateSitemap()).toBe(xml);
  });
});

describe('getGitLastmod — fallback behaviour', () => {
  it('warns and returns a UTC ISO timestamp when git rejects the path', () => {
    // Triggers the catch branch: git exits non-zero for an absolute path outside
    // the working tree, so getGitLastmod swallows the error and falls through to
    // nowISO(). The warning is the only on-failure signal a Vercel build with a
    // half-fetched repo will leave in logs, so we pin it down here.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = getGitLastmod('/path/git/has/never/seen.md');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T.+Z$/);
    expect(warn).toHaveBeenCalledOnce();
    const [message] = warn.mock.calls[0];
    expect(message).toContain('git log failed');
    warn.mockRestore();
  });
});
