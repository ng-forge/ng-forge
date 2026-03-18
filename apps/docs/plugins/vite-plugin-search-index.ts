/**
 * Vite plugin that generates a client-side search index from markdown content files.
 *
 * Dev mode: reads markdown files at startup, serves the index via middleware, watches for changes.
 * Build mode: generates the index once and emits it as a static asset.
 */

import { resolve, relative } from 'node:path';
import { readFileSync, readdirSync, statSync, watch } from 'node:fs';
import type { Plugin, ViteDevServer } from 'vite';

interface SearchIndexEntry {
  slug: string;
  title: string;
  content: string;
}

const CONTENT_DIR_NAME = 'public/content';

/**
 * Extract frontmatter fields from a markdown file's content.
 */
function parseFrontmatter(raw: string): { title: string; slug: string; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { title: '', slug: '', body: raw };

  const frontmatter = match[1];
  const body = match[2];

  const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
  const slugMatch = frontmatter.match(/^slug:\s*(.+)$/m);

  return {
    title: titleMatch?.[1]?.trim() ?? '',
    slug: slugMatch?.[1]?.trim() ?? '',
    body,
  };
}

/**
 * Strip markdown syntax to produce plain text for indexing.
 */
function stripMarkdown(md: string): string {
  return (
    md
      // Remove code blocks (fenced)
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]+`/g, '')
      // Remove images
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // Remove headings markers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic markers
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
      // Remove HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, '')
      // Remove blockquote markers
      .replace(/^>\s?/gm, '')
      // Collapse whitespace
      .replace(/\n{2,}/g, '\n')
      .trim()
  );
}

/**
 * Recursively collect all .md files from a directory.
 */
function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const fullPath = resolve(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...collectMarkdownFiles(fullPath));
      } else if (entry.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory may not exist
  }
  return files;
}

/**
 * Build the search index from all markdown content files.
 */
function buildSearchIndex(contentDir: string): SearchIndexEntry[] {
  const files = collectMarkdownFiles(contentDir);
  const entries: SearchIndexEntry[] = [];

  for (const file of files) {
    const raw = readFileSync(file, 'utf-8');
    const { title, slug, body } = parseFrontmatter(raw);

    if (!title || !slug) {
      // Fallback: derive slug from file path relative to content dir
      const relPath = relative(contentDir, file)
        .replace(/\.md$/, '')
        .replace(/\/index$/, '');
      entries.push({
        slug: slug || relPath,
        title: (title || relPath.split('/').pop()?.replace(/-/g, ' ')) ?? '',
        content: stripMarkdown(body),
      });
      continue;
    }

    entries.push({
      slug,
      title,
      content: stripMarkdown(body),
    });
  }

  return entries;
}

export function searchIndexPlugin(): Plugin {
  let contentDir: string;
  let cachedIndex: SearchIndexEntry[] | null = null;

  return {
    name: 'vite-plugin-search-index',

    configResolved(config) {
      contentDir = resolve(config.root, CONTENT_DIR_NAME);
    },

    // Dev: serve search index via middleware & watch for changes
    configureServer(server: ViteDevServer) {
      // Invalidate cache on file changes
      try {
        const watcher = watch(contentDir, { recursive: true }, () => {
          cachedIndex = null;
        });
        server.httpServer?.on('close', () => watcher.close());
      } catch {
        // Recursive fs.watch requires Linux kernel 5.9+ (fanotify). On older Linux,
        // the search index won't auto-invalidate during dev — restart the dev server instead.
      }

      server.middlewares.use((req, res, next) => {
        if (req.url !== '/__search-index.json') return next();

        if (!cachedIndex) {
          cachedIndex = buildSearchIndex(contentDir);
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(JSON.stringify(cachedIndex));
      });
    },

    // Build: emit the index as a static asset
    generateBundle() {
      const index = buildSearchIndex(contentDir);
      this.emitFile({
        type: 'asset',
        fileName: '__search-index.json',
        source: JSON.stringify(index),
      });
    },
  };
}
