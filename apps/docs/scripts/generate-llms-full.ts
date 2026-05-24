/**
 * Build the llms-full.txt content from documentation markdown sources.
 *
 * Reads all .md files from apps/docs/public/content/, strips YAML frontmatter,
 * and concatenates with section separators. Returns the result as a string —
 * the docs-meta Vite plugin emits or serves it.
 *
 * Section paths are derived from the file path relative to the content dir,
 * e.g., "validation/basics" for "apps/docs/public/content/validation/basics.md".
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const CONTENT_DIR = join(import.meta.dirname, '..', 'public', 'content');

function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (entry.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function getSectionPath(filePath: string): string {
  return relative(CONTENT_DIR, filePath).split(sep).join('/').replace(/\.md$/, '');
}

/** Strip YAML frontmatter (--- ... ---) from markdown content. */
function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}

export function generateLlmsFull(): string {
  const mdFiles = collectMarkdownFiles(CONTENT_DIR).sort();

  const sections: string[] = [
    '# ng-forge Dynamic Forms — Full Documentation',
    '',
    `> Generated from ${mdFiles.length} documentation files.`,
    `> Source: https://ng-forge.com/dynamic-forms/`,
    '',
  ];

  for (const filePath of mdFiles) {
    sections.push(`--- ${getSectionPath(filePath)} ---`);
    sections.push('');
    sections.push(stripFrontmatter(readFileSync(filePath, 'utf-8')));
    sections.push('');
  }

  return sections.join('\n');
}
