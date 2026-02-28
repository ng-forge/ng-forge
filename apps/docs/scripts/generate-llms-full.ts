/**
 * Generate llms-full.txt from documentation markdown sources.
 *
 * Reads all .md files from apps/docs/src/docs/, concatenates them with
 * section separators, and outputs to apps/docs/public/llms-full.txt.
 *
 * Section paths are derived from the file path relative to the docs directory,
 * e.g., "validation/basics" for "apps/docs/src/docs/validation/basics/index.md".
 *
 * Usage: npx tsx apps/docs/scripts/generate-llms-full.ts
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DOCS_DIR = join(__dirname, '..', 'src', 'docs');
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
  const rel = relative(DOCS_DIR, filePath);
  // Remove trailing /index.md or .md
  return rel.replace(/\/index\.md$/, '').replace(/\.md$/, '');
}

const mdFiles = collectMarkdownFiles(DOCS_DIR).sort();

const sections: string[] = [
  '# ng-forge Dynamic Forms — Full Documentation',
  '',
  `> Generated from ${mdFiles.length} documentation files.`,
  `> Source: https://ng-forge.com/dynamic-forms/`,
  '',
];

for (const filePath of mdFiles) {
  const sectionPath = getSectionPath(filePath);
  const content = readFileSync(filePath, 'utf-8').trim();

  sections.push(`--- ${sectionPath} ---`);
  sections.push('');
  sections.push(content);
  sections.push('');
}

writeFileSync(OUTPUT_FILE, sections.join('\n'), 'utf-8');

console.log(`Generated llms-full.txt with ${mdFiles.length} sections → ${OUTPUT_FILE}`);
