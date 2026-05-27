#!/usr/bin/env node
// Source-level JSDoc trimmer for shipped library packages.
//
// Complements scripts/strip-fesm-comments.mjs: that script removes comments
// from the published FESM at build time; this one keeps source/.d.ts lean
// at edit time so consumers' IntelliSense doesn't pull in 500+ KB of prose.
//
// For each /** ... */ block in TypeScript source under packages/:
//   1. Description (lines before the first @tag) is trimmed to the first
//      paragraph — lines up to the first blank `*` line.
//   2. @example blocks are removed entirely (line starting with `@example`
//      through the next @tag line or the end of the block).
//   3. @public tag lines are removed (redundant with the export keyword).
//   4. Stray blank `*` separator lines left over from the cuts are
//      collapsed; a block reduced to nothing is deleted.
//
// Preserved verbatim: @internal, @deprecated, @param, @returns, @see,
// @template, @typeParam, @throws, @value — these carry semantic value the
// type system doesn't express.
//
// Runs idempotently. Usage: node scripts/trim-jsdoc.mjs [path...]

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const DROP_TAGS = new Set(['example', 'public']);
const TAG_RE = /^\s*\*\s*@([a-zA-Z]+)/;
const BLANK_STAR_RE = /^\s*\*\s*$/;

async function walk(dir, out) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (
      e.isFile() &&
      e.name.endsWith('.ts') &&
      !e.name.endsWith('.spec.ts') &&
      !e.name.endsWith('.test.ts') &&
      !e.name.endsWith('.type-test.ts')
    ) {
      out.push(p);
    }
  }
}

function trimBlock(block, leadingIndent) {
  if (!block.includes('\n')) {
    const inner = block.slice(3, -2).trim();
    if (!inner) return '';
    const tagMatch = inner.match(/^@([a-zA-Z]+)\b/);
    if (tagMatch && DROP_TAGS.has(tagMatch[1])) return '';
    return `/** ${inner} */`;
  }
  const lines = block.split('\n');
  const open = lines[0];
  const close = lines[lines.length - 1];
  const body = lines.slice(1, -1);
  const indent = leadingIndent;

  let firstTagIdx = body.findIndex((l) => TAG_RE.test(l));
  if (firstTagIdx === -1) firstTagIdx = body.length;

  let description = body.slice(0, firstTagIdx);
  const tagBody = body.slice(firstTagIdx);

  const blankIdx = description.findIndex((l) => BLANK_STAR_RE.test(l));
  if (blankIdx !== -1) description = description.slice(0, blankIdx);

  while (description.length && BLANK_STAR_RE.test(description[description.length - 1])) {
    description.pop();
  }

  const keptTagSections = [];
  let current = null;
  for (const line of tagBody) {
    const m = line.match(TAG_RE);
    if (m) {
      if (current) keptTagSections.push(current);
      current = { tag: m[1], lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) keptTagSections.push(current);

  const finalTagLines = [];
  for (const sec of keptTagSections) {
    if (DROP_TAGS.has(sec.tag)) continue;
    while (sec.lines.length && BLANK_STAR_RE.test(sec.lines[sec.lines.length - 1])) {
      sec.lines.pop();
    }
    finalTagLines.push(...sec.lines);
  }

  if (description.length === 0 && finalTagLines.length === 0) {
    return '';
  }

  if (description.length === 1 && finalTagLines.length === 0) {
    const text = description[0].replace(/^\s*\*\s?/, '').trimEnd();
    if (text && !text.includes('*/')) {
      return `/** ${text} */`;
    }
  }

  const out = [open];
  out.push(...description);
  if (description.length && finalTagLines.length) {
    out.push(`${indent} *`);
  }
  out.push(...finalTagLines);
  out.push(close);
  return out.join('\n');
}

function processSource(src) {
  let out = '';
  let i = 0;
  let removed = 0;
  let trimmed = 0;
  while (i < src.length) {
    const start = src.indexOf('/**', i);
    if (start === -1) {
      out += src.slice(i);
      break;
    }
    if (src[start + 3] === '/') {
      out += src.slice(i, start + 4);
      i = start + 4;
      continue;
    }
    const end = src.indexOf('*/', start + 3);
    if (end === -1) {
      out += src.slice(i);
      break;
    }
    const block = src.slice(start, end + 2);
    out += src.slice(i, start);
    let lineStart = start;
    while (lineStart > 0 && src[lineStart - 1] !== '\n') lineStart--;
    const leadingIndent = src.slice(lineStart, start);
    const trimmedBlock = trimBlock(block, /^[ \t]*$/.test(leadingIndent) ? leadingIndent : '');
    if (trimmedBlock === '') {
      removed++;
      let consumeUntil = end + 2;
      const after = src.slice(consumeUntil);
      const newlineMatch = after.match(/^[ \t]*\n/);
      if (newlineMatch) consumeUntil += newlineMatch[0].length;
      const before = out;
      const trailing = before.match(/\n[ \t]*$/);
      if (trailing) {
        out = before.slice(0, before.length - trailing[0].length) + '\n';
      }
      i = consumeUntil;
    } else {
      if (trimmedBlock !== block) trimmed++;
      out += trimmedBlock;
      i = end + 2;
    }
  }
  return { out, removed, trimmed };
}

const roots = process.argv.slice(2);
if (roots.length === 0) roots.push('packages');

const files = [];
for (const r of roots) {
  const s = await stat(r).catch(() => null);
  if (!s) continue;
  if (s.isDirectory()) await walk(r, files);
  else files.push(r);
}

let totalBytesBefore = 0;
let totalBytesAfter = 0;
let totalFilesChanged = 0;
let totalRemoved = 0;
let totalTrimmed = 0;

for (const f of files) {
  const src = await readFile(f, 'utf8');
  totalBytesBefore += src.length;
  const { out, removed, trimmed } = processSource(src);
  totalBytesAfter += out.length;
  if (out !== src) {
    totalFilesChanged++;
    totalRemoved += removed;
    totalTrimmed += trimmed;
    await writeFile(f, out);
  }
}

const saved = totalBytesBefore - totalBytesAfter;
console.log(`Files scanned:   ${files.length}`);
console.log(`Files changed:   ${totalFilesChanged}`);
console.log(`Blocks removed:  ${totalRemoved}`);
console.log(`Blocks trimmed:  ${totalTrimmed}`);
console.log(`Bytes saved:     ${saved.toLocaleString()} (${(saved / 1024).toFixed(1)} KB)`);
console.log(`Source delta:    ${totalBytesBefore.toLocaleString()} -> ${totalBytesAfter.toLocaleString()}`);
