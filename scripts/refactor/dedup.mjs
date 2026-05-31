#!/usr/bin/env node
/**
 * Remove stale duplicates: any file present in BOTH internal/src/lib and src/lib
 * (the move left a copy behind). The internal copy is canonical; git rm the src/lib one.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, relative, resolve } from 'node:path';

const PKG = resolve('packages/dynamic-forms');
const INTERNAL = join(PKG, 'internal/src/lib');
const MAINLIB = join(PKG, 'src/lib');
const WRITE = process.argv.includes('--write');

const walk = (d, a = []) => {
  if (!existsSync(d)) return a;
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, a) : p.endsWith('.ts') && a.push(p);
  }
  return a;
};

let n = 0;
for (const intF of walk(INTERNAL)) {
  const rel = relative(INTERNAL, intF);
  const mainF = join(MAINLIB, rel);
  if (existsSync(mainF)) {
    n++;
    if (WRITE) execSync(`git rm -f "${mainF}"`, { stdio: 'pipe' });
  }
}
console.log(`duplicates_removed=${WRITE ? n : 0} duplicates_found=${n}`);
