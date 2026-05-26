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
//
// Pipeline: each library's `nx build` is a wrapper that depends on `compile`
// (which runs @nx/angular:package) and then invokes this script in place. The
// `compile` target's dist output is therefore the UNSTRIPPED FESM — anything
// downstream should depend on `build`, not `compile`, to get the final
// artifact. Today nothing in the workspace depends on `compile` directly.
//
// Idempotency: a second invocation on already-stripped output is a no-op
// (the fast path in processFesm short-circuits when no removable comments
// remain). This matters because Nx may re-run the script on a cache-warm
// dist if only the build target's inputs change.
//
// Cost: on a cold strip the parse + magic-string + remapping runs roughly
// 100ms per file, totalling ~1–2 seconds across the 5-library build. The
// idempotent fast path (parse only, no rewrite) is ~10ms per file — so a
// re-run on already-stripped output costs ~100ms total across all libs.
// Trivial vs ng-packagr's compile time but documented here so CI profilers
// can attribute the delta.

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { gzipSync } from 'node:zlib';
import { Parser } from 'acorn';
import MagicString from 'magic-string';
import remapping from '@ampproject/remapping';

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
 * The delete-only transform pairs cleanly with sourcemap composition: we only
 * ever shrink the output, so magic-string emits a fresh `output → FESM`
 * mapping that we later layer on top of the upstream `FESM → TS` rollup map
 * via @ampproject/remapping.
 *
 * @param {string} source - Raw FESM `.mjs` contents.
 * @returns {{ code: string, map: ReturnType<MagicString['generateMap']> }}
 */
function stripComments(source, comments) {
  const list = comments ?? collectComments(source);
  const s = new MagicString(source);
  for (const c of list) {
    if (shouldKeepComment(c)) continue;
    // Eat the trailing newline so the file doesn't end up with cosmetic
    // blank lines where docblocks used to be (those would compress less well
    // and add visual noise when consumers inspect the published bundle).
    let end = c.end;
    if (source[end] === '\n') end += 1;
    else if (source[end] === '\r' && source[end + 1] === '\n') end += 2;
    s.remove(c.start, end);
  }
  return { code: s.toString(), map: s.generateMap({ hires: false }) };
}

/**
 * Return true if `comments` contains nothing the strip pass would remove.
 * Used as an idempotency fast-path so re-running the script on already-
 * stripped output skips the parse-rewrite-emit cycle entirely.
 *
 * @param {ReturnType<typeof collectComments>} comments
 * @returns {boolean}
 */
function nothingToStrip(comments) {
  for (const c of comments) {
    if (!shouldKeepComment(c)) return false;
  }
  return true;
}

/**
 * Tokenize JS with acorn and return the full comment list. Used both by the
 * strip pass and by the post-strip audit so the JSDoc count is tokenizer-
 * correct (a `/** ... *\/` substring inside a string or template literal
 * doesn't false-positive a regex check).
 *
 * @param {string} source
 * @returns {Array<{ type: 'Block' | 'Line', value: string, start: number, end: number }>}
 */
function collectComments(source) {
  const comments = [];
  Parser.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowHashBang: true,
    onComment: (block, text, start, end) => {
      comments.push({ type: block ? 'Block' : 'Line', value: text, start, end });
    },
  });
  return comments;
}

/**
 * Count JSDoc blocks (source `/** ... *\/`) using acorn so the audit doesn't
 * false-positive on a `/**` substring inside a string/template literal.
 *
 * @param {string} source
 * @param {ReturnType<typeof collectComments>} [comments] - Pre-collected to avoid re-parsing.
 * @returns {number}
 */
function countJsdocBlocks(source, comments) {
  const list = comments ?? collectComments(source);
  let n = 0;
  for (const c of list) {
    if (c.type === 'Block' && c.value.startsWith('*')) n++;
  }
  return n;
}

/**
 * Count `__PURE__` occurrences *expected to survive the strip*. The naive
 * `(src.match(PURE_RE) || []).length` would over-count when JSDoc contains
 * literal `__PURE__` substrings (e.g., an @example demonstrating the
 * annotation). Pre-strip the over-count makes pureBefore larger than the
 * legitimate output count, and `pureAfter < pureBefore` would false-positive
 * the integrity assertion.
 *
 * Subtract PURE occurrences inside ranges that *will be* stripped (JSDoc and
 * dropped line comments) from the total.
 *
 * @param {string} source
 * @param {ReturnType<typeof collectComments>} comments
 * @returns {number}
 */
function countSurvivingPure(source, comments) {
  let total = (source.match(PURE_RE) || []).length;
  for (const c of comments) {
    if (shouldKeepComment(c)) continue;
    const inside = source.slice(c.start, c.end).match(PURE_RE);
    if (inside) total -= inside.length;
  }
  return total;
}

/**
 * Count `__PURE__` in any string. Used post-strip (where everything in the
 * output is by definition "surviving" code, so no comment-range subtraction
 * is needed).
 *
 * @param {string} src
 * @returns {number}
 */
function countPure(src) {
  return (src.match(PURE_RE) || []).length;
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

    // One acorn parse, reused for: integrity counts, idempotency check,
    // and the strip pass itself.
    const comments = collectComments(sourceCode);

    const sourceRaw = sourceCode.length;
    const sourceGz = gzipSync(sourceCode).length;
    const sourceJsdoc = countJsdocBlocks(sourceCode, comments);
    const sourcePureExpected = countSurvivingPure(sourceCode, comments);
    totals.rawBefore += sourceRaw;
    totals.gzBefore += sourceGz;
    totals.jsdocBefore += sourceJsdoc;
    totals.pureBefore += sourcePureExpected;

    // Fast path: already-stripped FESM (or one that never needed stripping).
    // Skips parse-rewrite-emit + sourcemap recomposition entirely.
    if (nothingToStrip(comments)) {
      totals.rawAfter += sourceRaw;
      totals.gzAfter += sourceGz;
      totals.jsdocAfter += sourceJsdoc;
      totals.pureAfter += countPure(sourceCode);
      continue;
    }

    const { code, map } = stripComments(sourceCode, comments);

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

    // Compose maps so debuggers land on the original `.ts` sources.
    // magic-string produces `output → FESM`; the upstream rollup map is
    // `FESM → TS`. @ampproject/remapping chains them by walking each output
    // segment, resolving its FESM position through the upstream map, and
    // emitting a final `output → TS` map. Just stitching `sources` from
    // upstream onto the magic-string map (what we did before) leaves
    // mappings still pointing at FESM offsets — debuggers would land on
    // wrong .ts lines.
    try {
      const upstreamRaw = await readFile(mapPath, 'utf8');
      const upstream = JSON.parse(upstreamRaw);
      const ourMap = {
        version: 3,
        file,
        sources: [file],
        sourcesContent: [sourceCode],
        names: [],
        mappings: map.mappings,
      };
      const composed = remapping(ourMap, (source) => (source === file ? upstream : null));
      await writeFile(mapPath, composed.toString());
    } catch {
      // No upstream map — write magic-string's own map as-is. This points at
      // the pre-strip FESM text rather than `.ts`, which is honest about
      // what's available rather than synthesizing a wrong-looking TS map.
      await writeFile(mapPath, map.toString());
    }

    totals.rawAfter += finalCode.length;
    totals.gzAfter += gzipSync(finalCode).length;
    totals.jsdocAfter += countJsdocBlocks(finalCode);
    totals.pureAfter += countPure(finalCode);
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
