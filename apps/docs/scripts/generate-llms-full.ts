/**
 * Generate llms-full.txt from documentation markdown sources.
 *
 * Reads all .md files from apps/docs/public/content/, strips frontmatter,
 * concatenates them with section separators, and outputs to apps/docs/public/llms-full.txt.
 *
 * Section paths are derived from the file path relative to the content directory,
 * e.g., "validation/basics" for "apps/docs/public/content/validation/basics.md".
 *
 * Usage: npx tsx apps/docs/scripts/generate-llms-full.ts
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTENT_DIR = join(__dirname, '..', 'public', 'content');
const OUTPUT_FILE = join(__dirname, '..', 'public', 'llms-full.txt');

function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (entry.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function getSectionPath(filePath: string): string {
  const rel = relative(CONTENT_DIR, filePath);
  return rel.replace(/\.md$/, '');
}

/** Strip YAML frontmatter (--- ... ---) from markdown content. */
function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}

const mdFiles = collectMarkdownFiles(CONTENT_DIR).sort();

const sections: string[] = [
  '# ng-forge Dynamic Forms — Full Documentation',
  '',
  `> Generated from ${mdFiles.length} documentation files.`,
  `> Source: https://ng-forge.com/dynamic-forms/`,
  '',
];

for (const filePath of mdFiles) {
  const sectionPath = getSectionPath(filePath);
  const raw = readFileSync(filePath, 'utf-8');
  const content = stripFrontmatter(raw);

  sections.push(`--- ${sectionPath} ---`);
  sections.push('');
  sections.push(content);
  sections.push('');
}

writeFileSync(OUTPUT_FILE, sections.join('\n'), 'utf-8');

console.log(`Generated llms-full.txt with ${mdFiles.length} sections → ${OUTPUT_FILE}`);
