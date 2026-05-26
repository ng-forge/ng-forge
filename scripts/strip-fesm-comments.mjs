#!/usr/bin/env node
// Strip prose JSDoc and source-level // line comments from FESM bundles
// while preserving:
//   /*#__PURE__*/ /*@__PURE__*/  — tree-shaking hints (Rollup/esbuild/Webpack)
//   /*! ... */, @license, @preserve  — legal headers
//   /* istanbul ... */            — coverage hints
//   //# sourceMappingURL=...      — sourcemap reference
//
// Uses acorn for tokenizer-correct comment positions (no false matches inside
// strings/templates/regex literals) and magic-string for sourcemap-aware
// deletion. Terser was rejected because it cannot preserve /*#__PURE__*/
// annotations attached to the correct AST position when compress is disabled
// (verified: places them on the parent statement, breaking tree-shaking).

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { gzipSync } from 'node:zlib';
import { Parser } from 'acorn';
import MagicString from 'magic-string';

const KEEP_BLOCK_RE = /^[#@*]?\s*(?:__PURE__|@?(?:license|preserve|cc_on)\b|istanbul\b)|^\*[\s\S]*@(?:license|preserve)\b/;
const KEEP_LINE_RE = /^#\s*sourceMappingURL=/;

const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g;
const PURE_RE = /__PURE__/g;

function shouldKeepComment(comment) {
  // comment.type is 'Block' for /* ... */ and 'Line' for //
  // comment.value is the text BETWEEN the markers (no /* */ or //)
  if (comment.type === 'Block') {
    // JSDoc starts with `*` in value (because source was `/**`)
    // PURE/license/preserve/istanbul keep their markers
    if (comment.value.startsWith('*') && !KEEP_BLOCK_RE.test(comment.value)) {
      return false; // JSDoc
    }
    return !comment.value.startsWith('*') ? KEEP_BLOCK_RE.test(comment.value.trim()) || true : true;
  }
  // Line comments: keep only sourceMappingURL
  return KEEP_LINE_RE.test(comment.value);
}

function stripComments(source) {
  const comments = [];
  // Acorn parses ES modules and collects comments via onComment.
  // We use the latest practical ecmaVersion so newer syntax doesn't break.
  Parser.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowHashBang: true,
    onComment: (block, text, start, end) => {
      comments.push({
        type: block ? 'Block' : 'Line',
        value: text,
        start,
        end,
      });
    },
  });

  const s = new MagicString(source);
  let dropped = 0;
  for (const c of comments) {
    if (shouldKeepComment(c)) continue;
    // Extend deletion to include the trailing newline if the comment was on
    // its own line, otherwise downstream gzip pays for orphan blank lines.
    let end = c.end;
    if (source[end] === '\n') end += 1;
    else if (source[end] === '\r' && source[end + 1] === '\n') end += 2;
    s.remove(c.start, end);
    dropped++;
  }
  return { code: s.toString(), map: s.generateMap({ hires: false }), dropped };
}

function countMatches(re, src) {
  return (src.match(re) || []).length;
}

async function processFesm(fesmDir) {
  let entries;
  try {
    entries = await readdir(fesmDir);
  } catch {
    return null;
  }
  const mjsFiles = entries.filter((f) => f.endsWith('.mjs'));
  if (mjsFiles.length === 0) return null;

  const totals = {
    files: mjsFiles.length,
    rawBefore: 0,
    rawAfter: 0,
    gzBefore: 0,
    gzAfter: 0,
    jsdocBefore: 0,
    jsdocAfter: 0,
    pureBefore: 0,
    pureAfter: 0,
  };

  for (const file of mjsFiles) {
    const filePath = join(fesmDir, file);
    const mapPath = `${filePath}.map`;
    const sourceCode = await readFile(filePath, 'utf8');
    totals.rawBefore += sourceCode.length;
    totals.gzBefore += gzipSync(sourceCode).length;
    totals.jsdocBefore += countMatches(JSDOC_RE, sourceCode);
    totals.pureBefore += countMatches(PURE_RE, sourceCode);

    const { code, map } = stripComments(sourceCode);

    // Preserve original sourceMappingURL by appending it back; if the original
    // file had `//# sourceMappingURL=...`, our keep rule retained it. If not,
    // and a .map file exists, ensure the FESM still references it.
    let finalCode = code;
    if (!/sourceMappingURL=/.test(finalCode)) {
      try {
        await stat(mapPath);
        finalCode = `${finalCode.trimEnd()}\n//# sourceMappingURL=${file}.map\n`;
      } catch {
        // No map; that's fine.
      }
    }

    await writeFile(filePath, finalCode);

    // We chained two transforms (original ngc → rollup, then our delete-only
    // pass). Without composing them we'd emit a mapping that points at the
    // FESM text instead of the original .ts sources. Read the upstream map and
    // apply our mapping on top so debug tools end up at source.
    try {
      const upstreamRaw = await readFile(mapPath, 'utf8');
      const upstream = JSON.parse(upstreamRaw);
      // magic-string returns a SourceMap-like object; compose by passing the
      // upstream sources/sourcesContent through to keep .ts file references.
      const composed = {
        version: 3,
        file: map.file ?? file,
        sources: upstream.sources,
        sourcesContent: upstream.sourcesContent,
        names: upstream.names,
        mappings: map.mappings,
      };
      await writeFile(mapPath, JSON.stringify(composed));
    } catch {
      // No upstream map — write magic-string's map as-is.
      await writeFile(mapPath, map.toString());
    }

    totals.rawAfter += finalCode.length;
    totals.gzAfter += gzipSync(finalCode).length;
    totals.jsdocAfter += countMatches(JSDOC_RE, finalCode);
    totals.pureAfter += countMatches(PURE_RE, finalCode);
  }

  return totals;
}

function fmtKB(n) {
  return (n / 1024).toFixed(1).padStart(7) + ' KB';
}

function fmtPct(before, after) {
  if (before === 0) return '   0.0%';
  return ((100 * (before - after)) / before).toFixed(1).padStart(6) + '%';
}

async function main() {
  const distDirs = process.argv.slice(2);
  if (distDirs.length === 0) {
    console.error('Usage: strip-fesm-comments.mjs <dist-dir> [<dist-dir> ...]');
    process.exit(1);
  }

  const rows = [];
  for (const dist of distDirs) {
    try {
      await stat(dist);
    } catch {
      console.warn(`[strip-fesm-comments] skip (not found): ${dist}`);
      continue;
    }
    const fesmDir = join(dist, 'fesm2022');
    const result = await processFesm(fesmDir);
    if (!result) {
      console.warn(`[strip-fesm-comments] skip (no fesm2022): ${dist}`);
      continue;
    }
    rows.push({ pkg: basename(dist), ...result });
  }

  if (rows.length === 0) {
    console.error('[strip-fesm-comments] nothing processed');
    process.exit(1);
  }

  console.log('');
  console.log('[strip-fesm-comments] FESM comment-strip results (gzip at default level 6)');
  console.log('─'.repeat(86));
  console.log('package'.padEnd(28) + 'files  raw before  raw after  gz before  gz after  Δ gzip');
  console.log('─'.repeat(86));

  const totals = { rawBefore: 0, rawAfter: 0, gzBefore: 0, gzAfter: 0 };
  const violations = [];

  for (const r of rows) {
    console.log(
      r.pkg.padEnd(28) +
        String(r.files).padStart(5) +
        '  ' +
        fmtKB(r.rawBefore) +
        '  ' +
        fmtKB(r.rawAfter) +
        '  ' +
        fmtKB(r.gzBefore) +
        '  ' +
        fmtKB(r.gzAfter) +
        '  ' +
        fmtPct(r.gzBefore, r.gzAfter),
    );
    totals.rawBefore += r.rawBefore;
    totals.rawAfter += r.rawAfter;
    totals.gzBefore += r.gzBefore;
    totals.gzAfter += r.gzAfter;

    if (r.jsdocAfter > 0) {
      violations.push(`${r.pkg}: ${r.jsdocAfter} JSDoc block(s) survived the strip`);
    }
    if (r.pureAfter < r.pureBefore) {
      violations.push(`${r.pkg}: tree-shaking annotations lost (PURE before=${r.pureBefore} after=${r.pureAfter})`);
    }
  }

  console.log('─'.repeat(86));
  console.log(
    'TOTAL'.padEnd(28) +
      '     ' +
      '  ' +
      fmtKB(totals.rawBefore) +
      '  ' +
      fmtKB(totals.rawAfter) +
      '  ' +
      fmtKB(totals.gzBefore) +
      '  ' +
      fmtKB(totals.gzAfter) +
      '  ' +
      fmtPct(totals.gzBefore, totals.gzAfter),
  );
  console.log('');

  if (violations.length > 0) {
    console.error('[strip-fesm-comments] integrity check failed:');
    for (const v of violations) console.error('  - ' + v);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[strip-fesm-comments] failed:', err);
  process.exit(1);
});
