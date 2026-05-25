#!/usr/bin/env -S npx tsx
// One-off audit script: parses every expression string found in docs MD files
// through the real ExpressionParser to surface any that fail to parse.
//
// Run from repo root:  npx tsx scripts/audit-doc-expressions.mts

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ExpressionParser } from '../packages/dynamic-forms/src/lib/core/expressions/parser/expression-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const DOCS_ROOT = join(REPO_ROOT, 'apps/docs/public/content');

interface ExpressionMatch {
  file: string;
  line: number;
  context: string;
  expression: string;
}

interface ParseFailure extends ExpressionMatch {
  error: string;
}

function walkMarkdown(root: string): string[] {
  const out: string[] = [];
  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (entry.endsWith('.md')) out.push(full);
    }
  }
  walk(root);
  return out;
}

// Keys whose string values flow through ExpressionParser. Other keys
// (`value`, `url`, `label`, etc.) carry arbitrary text and aren't parsed.
const EXPRESSION_KEYS = ['expression', 'responseExpression', 'derivation'] as const;

function extractExpressions(file: string, content: string): ExpressionMatch[] {
  const out: ExpressionMatch[] = [];

  const pattern = new RegExp(`\\b(${EXPRESSION_KEYS.join('|')})\\s*:\\s*(?:'([^']+)'|"([^"]+)")`, 'g');

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const key = match[1];
    const expression = match[2] ?? match[3];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    out.push({
      file,
      line: lineNumber,
      context: `${key}: '${expression}'`,
      expression,
    });
  }

  return out;
}

function main(): void {
  const files = walkMarkdown(DOCS_ROOT);
  const allExpressions: ExpressionMatch[] = [];
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    allExpressions.push(...extractExpressions(file, content));
  }

  const failures: ParseFailure[] = [];
  for (const match of allExpressions) {
    try {
      ExpressionParser.parse(match.expression);
    } catch (err) {
      failures.push({
        ...match,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log(`Scanned ${files.length} markdown files`);
  console.log(`Found ${allExpressions.length} expression strings`);
  console.log(`Parse failures: ${failures.length}`);

  if (failures.length > 0) {
    console.log('\n=== FAILURES ===');
    for (const f of failures) {
      console.log(`\n${relative(REPO_ROOT, f.file)}:${f.line}`);
      console.log(`  ${f.context}`);
      console.log(`  ERROR: ${f.error}`);
    }
    process.exit(1);
  }

  console.log('\nAll expressions parse successfully.');
}

main();
