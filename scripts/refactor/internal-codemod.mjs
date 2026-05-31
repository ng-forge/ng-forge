#!/usr/bin/env node
/**
 * Filesystem-driven codemod for the /internal entrypoint refactor.
 *
 * For every relative import in packages/dynamic-forms/src/lib/**, if the import's
 * target no longer exists under src/lib but DOES exist at the mirrored path under
 * internal/src/lib, rewrite the specifier to '@ng-forge/dynamic-forms/internal'.
 *
 * Self-maintaining: move files into internal, run this, it fixes every reference.
 * Default = DRY RUN. Pass --write to apply.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';

const PKG = resolve(process.argv.find((a) => a.startsWith('packages/')) ?? 'packages/dynamic-forms');
const MAINLIB = join(PKG, 'src/lib');
const INTERNAL = join(PKG, 'internal/src/lib');
const WRITE = process.argv.includes('--write');
const SPEC = '@ng-forge/dynamic-forms/internal';

function existsAsModule(baseNoExt) {
  return existsSync(baseNoExt + '.ts') || existsSync(join(baseNoExt, 'index.ts'));
}

function walk(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (p.endsWith('.ts')) acc.push(p);
  }
  return acc;
}

const RE = /(\bfrom\s+|\bimport\s+)(['"])(\.[^'"]+)\2/g;
let filesChanged = 0,
  importsChanged = 0;
const samples = [];

for (const file of walk(MAINLIB)) {
  const src = readFileSync(file, 'utf8');
  let n = 0;
  const out = src.replace(RE, (m, kw, q, spec) => {
    const absNoExt = resolve(dirname(file), spec);
    const relFromLib = relative(MAINLIB, absNoExt);
    if (relFromLib.startsWith('..')) return m; // outside src/lib
    const stillInMain = existsAsModule(join(MAINLIB, relFromLib));
    const nowInInternal = existsAsModule(join(INTERNAL, relFromLib));
    if (!stillInMain && nowInInternal) {
      n++;
      importsChanged++;
      if (samples.length < 10) samples.push(`${relative(PKG, file)}: ${spec} -> ${SPEC}`);
      return `${kw}${q}${SPEC}${q}`;
    }
    return m;
  });
  if (n > 0) {
    filesChanged++;
    if (WRITE) writeFileSync(file, out);
  }
}

console.log(`codemod ${WRITE ? 'WRITE' : 'DRY'}: files=${filesChanged} imports=${importsChanged}`);
for (const s of samples) console.log('  ' + s);
