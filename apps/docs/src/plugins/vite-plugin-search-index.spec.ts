import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Plugin } from 'vite';

// Stub the workspace API scan so this spec tests markdown extraction in
// isolation. The real `getApiPackages()` walks the repo via ts-morph (slow,
// ~400 entries) and would otherwise leak into every assertion here.
vi.mock('../../plugins/vite-plugin-api-docs', () => ({
  getApiPackages: () => new Map(),
}));

import { searchIndexPlugin } from '../../plugins/vite-plugin-search-index';

function createTempDir(id: string): string {
  const root = resolve(`/tmp/test-search-index-${id}-${Date.now()}`);
  const contentDir = join(root, 'public', 'content');
  mkdirSync(contentDir, { recursive: true });
  return root;
}

function writeContent(root: string, relativePath: string, content: string): void {
  const fullPath = join(root, 'public', 'content', relativePath);
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(fullPath, content, 'utf-8');
}

function runPlugin(root: string): { fileName: string; source: string }[] {
  const plugin = searchIndexPlugin() as Plugin & {
    configResolved: (config: { root: string }) => void;
    generateBundle: (this: { emitFile: (file: unknown) => void }) => void;
  };

  plugin.configResolved!({ root } as any);

  const emitted: { fileName: string; source: string }[] = [];
  plugin.generateBundle!.call({
    emitFile(file: any) {
      emitted.push({ fileName: file.fileName, source: file.source });
    },
  });

  return emitted;
}

function parseIndex(emitted: { fileName: string; source: string }[]): any[] {
  const asset = emitted.find((e) => e.fileName === '__search-index.json');
  return asset ? JSON.parse(asset.source) : [];
}

describe('vite-plugin-search-index', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        // ignore cleanup failures
      }
    }
    tempDirs.length = 0;
  });

  function makeTempDir(id: string): string {
    const dir = createTempDir(id);
    tempDirs.push(dir);
    return dir;
  }

  it('should return correct plugin name', () => {
    const plugin = searchIndexPlugin();
    expect(plugin.name).toBe('vite-plugin-search-index');
  });

  it('should emit __search-index.json asset', () => {
    const root = makeTempDir('emit');
    writeContent(root, 'test.md', '---\ntitle: Test\nslug: test\n---\nHello world');

    const emitted = runPlugin(root);
    expect(emitted).toHaveLength(1);
    expect(emitted[0].fileName).toBe('__search-index.json');
  });

  it('should emit valid JSON', () => {
    const root = makeTempDir('json');
    writeContent(root, 'test.md', '---\ntitle: Test\nslug: test\n---\nContent here');

    const emitted = runPlugin(root);
    expect(() => JSON.parse(emitted[0].source)).not.toThrow();
  });

  it('should emit an empty array when no markdown files exist', () => {
    const root = makeTempDir('empty');
    const entries = parseIndex(runPlugin(root));
    expect(entries).toEqual([]);
  });

  it('should extract title and slug from frontmatter', () => {
    const root = makeTempDir('frontmatter');
    writeContent(root, 'getting-started.md', '---\ntitle: Getting Started\nslug: getting-started\n---\nWelcome to the docs.');

    const entries = parseIndex(runPlugin(root));
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe('Getting Started');
    expect(entries[0].slug).toBe('getting-started');
    expect(entries[0].content).toContain('Welcome to the docs.');
  });

  it('should handle multiple files', () => {
    const root = makeTempDir('multi');
    writeContent(root, 'a.md', '---\ntitle: Alpha\nslug: alpha\n---\nFirst doc.');
    writeContent(root, 'b.md', '---\ntitle: Beta\nslug: beta\n---\nSecond doc.');

    const entries = parseIndex(runPlugin(root));
    expect(entries).toHaveLength(2);
    const slugs = entries.map((e: any) => e.slug).sort();
    expect(slugs).toEqual(['alpha', 'beta']);
  });

  it('should use path-derived slug for files without frontmatter', () => {
    const root = makeTempDir('no-fm');
    writeContent(root, 'my-page.md', 'Just some content without frontmatter.');

    const entries = parseIndex(runPlugin(root));
    expect(entries).toHaveLength(1);
    expect(entries[0].slug).toBe('my-page');
    expect(entries[0].title).toBe('my page');
  });

  it('should derive slug from nested path for files without slug', () => {
    const root = makeTempDir('nested-no-slug');
    writeContent(root, 'validation/basics.md', '---\ntitle: Basics\n---\nValidation basics.');

    const entries = parseIndex(runPlugin(root));
    expect(entries).toHaveLength(1);
    expect(entries[0].slug).toBe('validation/basics');
    expect(entries[0].title).toBe('Basics');
  });

  it('should strip /index from path-derived slugs', () => {
    const root = makeTempDir('index-strip');
    writeContent(root, 'section/index.md', 'Index page content.');

    const entries = parseIndex(runPlugin(root));
    expect(entries).toHaveLength(1);
    expect(entries[0].slug).toBe('section');
  });

  it('should strip markdown headings from content', () => {
    const root = makeTempDir('headings');
    writeContent(root, 'test.md', '---\ntitle: Test\nslug: test\n---\n## Section Header\nBody text.');

    const entries = parseIndex(runPlugin(root));
    expect(entries[0].content).not.toContain('##');
    expect(entries[0].content).toContain('Section Header');
    expect(entries[0].content).toContain('Body text.');
  });

  it('should remove fenced code blocks from content', () => {
    const root = makeTempDir('code');
    writeContent(root, 'test.md', '---\ntitle: Test\nslug: test\n---\nBefore code.\n```typescript\nconst x = 1;\n```\nAfter code.');

    const entries = parseIndex(runPlugin(root));
    expect(entries[0].content).not.toContain('const x = 1');
    expect(entries[0].content).not.toContain('```');
    expect(entries[0].content).toContain('Before code.');
    expect(entries[0].content).toContain('After code.');
  });

  it('should remove inline code from content', () => {
    const root = makeTempDir('inline-code');
    writeContent(root, 'test.md', '---\ntitle: Test\nslug: test\n---\nUse `formConfig` to set up.');

    const entries = parseIndex(runPlugin(root));
    expect(entries[0].content).not.toContain('`');
    expect(entries[0].content).toContain('Use');
    expect(entries[0].content).toContain('to set up.');
  });

  it('should strip HTML tags from content', () => {
    const root = makeTempDir('html');
    writeContent(root, 'test.md', '---\ntitle: Test\nslug: test\n---\n<div class="note">Important info</div>');

    const entries = parseIndex(runPlugin(root));
    expect(entries[0].content).not.toContain('<div');
    expect(entries[0].content).not.toContain('</div>');
    expect(entries[0].content).toContain('Important info');
  });

  it('should strip bold and italic markers', () => {
    const root = makeTempDir('emphasis');
    writeContent(root, 'test.md', '---\ntitle: Test\nslug: test\n---\nThis is **bold** and *italic* text.');

    const entries = parseIndex(runPlugin(root));
    expect(entries[0].content).not.toContain('**');
    expect(entries[0].content).not.toContain('*italic*');
    expect(entries[0].content).toContain('bold');
    expect(entries[0].content).toContain('italic');
  });

  it('should strip markdown link syntax but keep link text', () => {
    const root = makeTempDir('links');
    writeContent(root, 'test.md', '---\ntitle: Test\nslug: test\n---\nSee [the docs](https://example.com) for more.');

    const entries = parseIndex(runPlugin(root));
    expect(entries[0].content).not.toContain('[the docs]');
    expect(entries[0].content).not.toContain('(https://');
    expect(entries[0].content).toContain('the docs');
  });

  it('should remove image syntax entirely', () => {
    const root = makeTempDir('images');
    writeContent(root, 'test.md', '---\ntitle: Test\nslug: test\n---\nBefore ![alt text](image.png) after.');

    const entries = parseIndex(runPlugin(root));
    expect(entries[0].content).not.toContain('![');
    expect(entries[0].content).not.toContain('image.png');
    expect(entries[0].content).toContain('Before');
    expect(entries[0].content).toContain('after.');
  });

  it('should recursively collect files from subdirectories', () => {
    const root = makeTempDir('recursive');
    writeContent(root, 'top.md', '---\ntitle: Top\nslug: top\n---\nTop level.');
    writeContent(root, 'sub/nested.md', '---\ntitle: Nested\nslug: sub/nested\n---\nNested content.');
    writeContent(root, 'sub/deep/file.md', '---\ntitle: Deep\nslug: sub/deep/file\n---\nDeeply nested.');

    const entries = parseIndex(runPlugin(root));
    expect(entries).toHaveLength(3);
    const slugs = entries.map((e: any) => e.slug).sort();
    expect(slugs).toEqual(['sub/deep/file', 'sub/nested', 'top']);
  });

  it('should handle files with frontmatter but empty body', () => {
    const root = makeTempDir('empty-body');
    writeContent(root, 'empty.md', '---\ntitle: Empty\nslug: empty\n---\n');

    const entries = parseIndex(runPlugin(root));
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe('Empty');
    expect(entries[0].content).toBe('');
  });

  it('should handle non-existent content directory gracefully', () => {
    const root = resolve(`/tmp/test-search-index-nodir-${Date.now()}`);
    mkdirSync(root, { recursive: true });
    tempDirs.push(root);

    const emitted = runPlugin(root);
    const entries = parseIndex(emitted);
    expect(entries).toEqual([]);
  });
});
