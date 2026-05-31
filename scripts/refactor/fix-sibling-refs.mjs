#!/usr/bin/env node
/**
 * Fix dangling relative imports in sibling entrypoint dirs (testing/src,
 * integration/src) that point into kernel files which MOVED to internal/src/lib.
 *
 * For each relative import in the given roots: resolve its target. If the target
 * no longer exists at its computed location but DOES exist at the mirrored path
 * under internal/src/lib, rewrite the specifier to '@ng-forge/dynamic-forms/internal'.
 *
 * DRY by default; --write to apply.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';

const PKG = resolve('packages/dynamic-forms');
const INTERNAL = join(PKG, 'internal/src/lib');
const SPEC = '@ng-forge/dynamic-forms/internal';
const WRITE = process.argv.includes('--write');
const ROOTS = process.argv
  .slice(2)
  .filter((a) => !a.startsWith('--'))
  .map((r) => resolve(r));

const existsMod = (noExt) => existsSync(noExt + '.ts') || existsSync(join(noExt, 'index.ts'));
const walk = (d, a = []) => {
  if (!existsSync(d)) return a;
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, a) : p.endsWith('.ts') && a.push(p);
  }
  return a;
};

// Map an absolute target (that resolved into .../src/lib/X) to internal mirror .../internal/src/lib/X
const SRCLIB = join(PKG, 'src/lib');
const RE = /(\bfrom\s+|\bimport\s+)(['"])(\.[^'"]+)\2/g;

let filesChanged = 0,
  importsChanged = 0;
const samples = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8');
    let n = 0;
    const out = src.replace(RE, (m, kw, q, spec) => {
      const absNoExt = resolve(dirname(file), spec);
      // only care about targets that point into src/lib
      if (!absNoExt.startsWith(SRCLIB + '/')) return m;
      const stillThere = existsMod(absNoExt);
      const relFromSrcLib = relative(SRCLIB, absNoExt);
      const internalMirror = join(INTERNAL, relFromSrcLib);
      const inInternal = existsMod(internalMirror);
      if (!stillThere && inInternal) {
        n++;
        importsChanged++;
        if (samples.length < 15) samples.push(`${relative(PKG, file)}: ${spec} -> ${SPEC}`);
        return `${kw}${q}${SPEC}${q}`;
      }
      return m;
    });
    if (n > 0) {
      filesChanged++;
      if (WRITE) writeFileSync(file, out);
    }
  }
}
console.log(`fix-sibling-refs ${WRITE ? 'WRITE' : 'DRY'}: files=${filesChanged} imports=${importsChanged}`);
for (const s of samples) console.log('  ' + s);
