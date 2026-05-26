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

const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g;
const PURE_RE = /__PURE__/g;
const LEGAL_MARKER_RE = /@(?:license|preserve)\b/;
const SOURCEMAPPING_URL_RE = /^#\s*sourceMappingURL=/;

/**
 * Decide whether a parsed comment should survive the strip pass.
 *
 * Acorn's `onComment` callback gives the comment value WITHOUT the surrounding
 * `/*`/`*\/` or `//` markers, so we inspect the inner text to classify:
 *
 *   source           comment.type   comment.value (excerpt)
 *   ---------------  -------------  -----------------------
 *   /** ... *\/      'Block'        '* ...' (note leading *)
 *   /*! @license *\/ 'Block'        '! @license '
 *   /*#__PURE__*\/   'Block'        '#__PURE__'
 *   /* istanbul *\/  'Block'        ' istanbul '
 *   // ...           'Line'         ' ...'
 *
 * Default policy: drop JSDoc and prose line comments; keep everything else.
 * The single exception for line comments is `//# sourceMappingURL=...` so
 * `magic-string`-emitted output still references the rewritten map.
 *
 * @param {{ type: 'Block' | 'Line', value: string }} comment
 * @returns {boolean} true if the comment must be retained verbatim.
 */
function shouldKeepComment(comment) {
  if (comment.type === 'Line') {
    return SOURCEMAPPING_URL_RE.test(comment.value);
  }
  // Block comments: only JSDoc `*...` is dropped, and only when it doesn't
  // carry a legal marker. Everything else (PURE, license headers, istanbul
  // hints, third-party banners) survives untouched in its original position.
  if (comment.value.startsWith('*')) {
    return LEGAL_MARKER_RE.test(comment.value);
  }
  return true;
}

/**
 * Parse the FESM source with acorn, collect comment positions, then delete
 * the ones `shouldKeepComment` rejects via magic-string.
 *
 * The delete-only transform makes sourcemap composition trivial: we only ever
 * shrink the output, so magic-string's mapping can be layered on top of the
 * upstream rollup map without re-walking segments.
 *
 * @param {string} source - Raw FESM `.mjs` contents.
 * @returns {{ code: string, map: import('magic-string').SourceMap, dropped: number }}
 */
function stripComments(source) {
  const comments = [];
  Parser.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowHashBang: true,
    onComment: (block, text, start, end) => {
      comments.push({ type: block ? 'Block' : 'Line', value: text, start, end });
    },
  });

  const s = new MagicString(source);
  let dropped = 0;
  for (const c of comments) {
    if (shouldKeepComment(c)) continue;
    // Eat the trailing newline so the file doesn't end up with cosmetic
    // blank lines where docblocks used to be (those would compress less well
    // and add visual noise when consumers inspect the published bundle).
    let end = c.end;
    if (source[end] === '\n') end += 1;
    else if (source[end] === '\r' && source[end + 1] === '\n') end += 2;
    s.remove(c.start, end);
    dropped++;
  }
  return { code: s.toString(), map: s.generateMap({ hires: false }), dropped };
}

/**
 * Count occurrences of a global RegExp without allocating the match array
 * twice. Used for the pre/post integrity audit (JSDoc must hit zero; PURE
 * count must not drop).
 *
 * @param {RegExp} re - Must have the `g` flag.
 * @param {string} src
 * @returns {number}
 */
function countMatches(re, src) {
  return (src.match(re) || []).length;
}

/**
 * Strip every `.mjs` in `<distDir>/fesm2022/`, compose a new sourcemap
 * (carrying the upstream `sources` / `sourcesContent` so debug tools resolve
 * to original `.ts` files), and return totals for reporting.
 *
 * Returns `null` if the directory doesn't exist or contains no `.mjs` files,
 * so the orchestrator can skip non-Angular packages without failing.
 *
 * @param {string} fesmDir - Absolute or workspace-relative path to a `fesm2022/` directory.
 * @returns {Promise<{
 *   files: number,
 *   rawBefore: number, rawAfter: number,
 *   gzBefore: number, gzAfter: number,
 *   jsdocBefore: number, jsdocAfter: number,
 *   pureBefore: number, pureAfter: number,
 * } | null>}
 */
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

    // If the original file's `//# sourceMappingURL=` line was retained (it
    // matches our keep rule), there's nothing to do. Otherwise re-attach it
    // so debuggers still find the rewritten map.
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

    // Compose the upstream rollup map with our delete-only mapping so debug
    // tools end up at the original `.ts` files instead of the FESM text.
    // magic-string emits a fresh `mappings` table relative to the FESM; we
    // graft on the upstream `sources` / `sourcesContent` / `names`.
    try {
      const upstreamRaw = await readFile(mapPath, 'utf8');
      const upstream = JSON.parse(upstreamRaw);
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

/**
 * Format a byte count as a right-aligned KB string for the summary table.
 *
 * @param {number} n - Byte count.
 * @returns {string} e.g. `'  237.2 KB'`.
 */
function fmtKB(n) {
  return (n / 1024).toFixed(1).padStart(7) + ' KB';
}

/**
 * Format a before/after delta as a right-aligned percentage reduction.
 *
 * @param {number} before
 * @param {number} after
 * @returns {string} e.g. `' 50.2%'`. Zero baseline returns `'   0.0%'`.
 */
function fmtPct(before, after) {
  if (before === 0) return '   0.0%';
  return ((100 * (before - after)) / before).toFixed(1).padStart(6) + '%';
}

/**
 * Orchestrate the strip across one or more `<dist>/fesm2022/` directories,
 * print a per-package size table, and enforce integrity assertions.
 *
 * Exits non-zero (failing the Nx build) if any of these post-conditions fail:
 *   - a `/** ... *\/` JSDoc block survived the strip in any file
 *   - the total `__PURE__` count dropped for any package (silent tree-shaking
 *     regression — bundlers would retain code that was previously DCE'd)
 *
 * @returns {Promise<void>}
 */
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
