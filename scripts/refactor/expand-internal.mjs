#!/usr/bin/env node
/**
 * Move the transitive closure of files the /internal entrypoint needs from
 * src/lib into internal/src/lib (preserving subpaths, incl. spec/type-test
 * companions). Re-runnable: only moves files not yet in internal.
 *
 * DRY by default; pass --write to git mv.
 */
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname, resolve, relative } from 'node:path';

const PKG = resolve('packages/dynamic-forms');
const INTERNAL = join(PKG, 'internal/src/lib');
const MAINLIB = join(PKG, 'src/lib');
const WRITE = process.argv.includes('--write');

const resolveImport = (spec, from) => {
  if (!spec.startsWith('.')) return null;
  const base = resolve(dirname(from), spec);
  for (const c of [base + '.ts', join(base, 'index.ts')]) if (existsSync(c)) return c;
  // Target not found at `base`. If importing file already lives in INTERNAL, the
  // target may simply not have moved yet — check the mirrored src/lib location.
  if (from.startsWith(INTERNAL + '/')) {
    const mirror = base.replace(INTERNAL, MAINLIB);
    for (const c of [mirror + '.ts', join(mirror, 'index.ts')]) if (existsSync(c)) return c;
  }
  return base + '.ts';
};
const IMP = /from\s+['"](\.[^'"]+)['"]/g;
const imports = (f) => {
  if (!existsSync(f)) return [];
  const s = readFileSync(f, 'utf8');
  const o = [];
  let m;
  while ((m = IMP.exec(s))) o.push(m[1]);
  return o;
};
const isSpec = (f) => f.endsWith('.spec.ts') || f.endsWith('.type-test.ts');
const walk = (d, a = []) => {
  if (!existsSync(d)) return a;
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, a) : p.endsWith('.ts') && !isSpec(p) && a.push(p);
  }
  return a;
};

const visited = new Set(walk(INTERNAL));
const queue = [...visited];
const toMove = new Set();
while (queue.length) {
  const f = queue.shift();
  for (const spec of imports(f)) {
    const t = resolveImport(spec, f);
    if (!t) continue;
    if (t.startsWith(INTERNAL + '/')) {
      if (!visited.has(t)) {
        visited.add(t);
        queue.push(t);
      }
    } else if (t.startsWith(MAINLIB + '/')) {
      if (!toMove.has(t)) {
        toMove.add(t);
        visited.add(t);
        queue.push(t);
      }
    }
  }
}

let moved = 0;
for (const abs of [...toMove].sort()) {
  const rel = relative(MAINLIB, abs); // e.g. core/logic/non-field-logic-resolver.ts
  const stem = rel.replace(/\.ts$/, '');
  // move source + companions
  for (const ext of ['.ts', '.spec.ts', '.type-test.ts']) {
    const srcF = join(MAINLIB, stem + ext);
    if (!existsSync(srcF)) continue;
    const dstF = join(INTERNAL, stem + ext);
    console.log(`${WRITE ? 'mv' : 'would-mv'} ${stem + ext}`);
    if (WRITE) {
      mkdirSync(dirname(dstF), { recursive: true });
      execSync(`git mv "${srcF}" "${dstF}"`, { stdio: 'pipe' });
      moved++;
    }
  }
}
console.log(`\n${WRITE ? 'moved' : 'would move'} ${WRITE ? moved : toMove.size} files (closure size ${toMove.size})`);
