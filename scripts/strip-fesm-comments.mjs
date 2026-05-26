#!/usr/bin/env node
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { gzipSync } from 'node:zlib';
import { minify } from 'terser';

const TERSER_OPTIONS = {
  compress: false,
  mangle: false,
  format: {
    comments: false,
    beautify: true,
    indent_level: 0,
    max_line_len: false,
    semicolons: true,
  },
  ecma: 2022,
  module: true,
};

async function processFesm(fesmDir) {
  let entries;
  try {
    entries = await readdir(fesmDir);
  } catch {
    return null;
  }
  const mjsFiles = entries.filter((f) => f.endsWith('.mjs'));
  if (mjsFiles.length === 0) return null;

  let rawBefore = 0;
  let rawAfter = 0;
  let gzBefore = 0;
  let gzAfter = 0;

  for (const file of mjsFiles) {
    const filePath = join(fesmDir, file);
    const mapPath = `${filePath}.map`;
    const sourceCode = await readFile(filePath, 'utf8');
    rawBefore += sourceCode.length;
    gzBefore += gzipSync(sourceCode, { level: 9 }).length;

    let sourceMapContent = null;
    try {
      sourceMapContent = await readFile(mapPath, 'utf8');
    } catch {
      // No source map; that's fine.
    }

    const opts = { ...TERSER_OPTIONS };
    if (sourceMapContent) {
      opts.sourceMap = {
        content: sourceMapContent,
        filename: file,
        url: `${file}.map`,
      };
    }

    const result = await minify({ [file]: sourceCode }, opts);
    if (result.code == null) {
      throw new Error(`Terser returned no code for ${filePath}`);
    }

    await writeFile(filePath, result.code);
    if (result.map) {
      await writeFile(mapPath, typeof result.map === 'string' ? result.map : JSON.stringify(result.map));
    }

    rawAfter += result.code.length;
    gzAfter += gzipSync(result.code, { level: 9 }).length;
  }

  return { files: mjsFiles.length, rawBefore, rawAfter, gzBefore, gzAfter };
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
  console.log('[strip-fesm-comments] FESM comment-strip results');
  console.log('─'.repeat(86));
  console.log('package'.padEnd(28) + 'files  ' + 'raw before  raw after  '.padStart(0) + 'gz before  gz after  Δ gzip');
  console.log('─'.repeat(86));

  let totalRawBefore = 0;
  let totalRawAfter = 0;
  let totalGzBefore = 0;
  let totalGzAfter = 0;

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
    totalRawBefore += r.rawBefore;
    totalRawAfter += r.rawAfter;
    totalGzBefore += r.gzBefore;
    totalGzAfter += r.gzAfter;
  }

  console.log('─'.repeat(86));
  console.log(
    'TOTAL'.padEnd(28) +
      '     ' +
      '  ' +
      fmtKB(totalRawBefore) +
      '  ' +
      fmtKB(totalRawAfter) +
      '  ' +
      fmtKB(totalGzBefore) +
      '  ' +
      fmtKB(totalGzAfter) +
      '  ' +
      fmtPct(totalGzBefore, totalGzAfter),
  );
  console.log('');
}

main().catch((err) => {
  console.error('[strip-fesm-comments] failed:', err);
  process.exit(1);
});
