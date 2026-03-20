/**
 * Vite plugin that generates a client-side search index from markdown content files
 * and API reference declarations.
 *
 * Dev mode: reads markdown files at startup, serves the index via middleware, watches for changes.
 * Build mode: generates the index once and emits it as a static asset.
 */

import { resolve, relative } from 'node:path';
import { readFileSync, readdirSync, statSync, watch } from 'node:fs';
import type { Plugin, ViteDevServer } from 'vite';
import { getApiPackages, invalidateApiCache, type ApiDeclaration, type ApiPackage } from './vite-plugin-api-docs';

interface SearchIndexEntry {
  slug: string;
  title: string;
  content: string;
  category?: string;
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
  let result = md
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
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1');

  // Remove HTML tags — loop until stable to handle nested/malformed tags
  // (e.g., `<scr<script>ipt>` collapses to `<script>` after one pass)
  const TAG_RE = /<[^>]*>/g;
  let prev: string;
  do {
    prev = result;
    result = result.replace(TAG_RE, '');
  } while (result !== prev);

  return (
    result
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
 * Build searchable text from an API declaration by combining its
 * description, signature, and member names.
 */
function buildApiContent(decl: ApiDeclaration): string {
  const parts: string[] = [];
  if (decl.description) parts.push(decl.description);
  if (decl.signature) parts.push(decl.signature);
  if (decl.members.length > 0) {
    parts.push(decl.members.map((m) => m.name).join(' '));
  }
  if (decl.params?.length) {
    parts.push(decl.params.map((p) => p.name).join(' '));
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Pretty-print the declaration kind for display (e.g., "interface" → "Interface").
 */
function formatKind(kind: string): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

/**
 * Build API reference search entries from all extracted packages.
 */
function buildApiSearchEntries(): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];
  const seen = new Set<string>();

  try {
    const packages = getApiPackages();
    for (const pkg of packages.values()) {
      for (const decl of pkg.declarations) {
        // Deduplicate by name — same symbol may appear in multiple packages
        if (seen.has(decl.name)) continue;
        seen.add(decl.name);

        entries.push({
          slug: `api-reference/${decl.name}`,
          title: decl.name,
          content: buildApiContent(decl),
          category: `API ${formatKind(decl.kind)}`,
        });
      }
    }
  } catch (err) {
    console.warn('[search-index] Could not extract API entries:', err);
  }

  return entries;
}

/**
 * Build the search index from all markdown content files and API reference data.
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

  // Append API reference entries
  entries.push(...buildApiSearchEntries());

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
