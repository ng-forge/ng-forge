#!/usr/bin/env node
/**
 * Compute the TRUE transitive closure of files the /internal entrypoint needs.
 *
 * Starts from every non-spec .ts already in internal/src/lib, follows relative
 * imports. Any import that resolves back into src/lib (main) is an "escape" that
 * must ALSO move into internal. Follows escapes transitively until stable.
 *
 * Output: the set of src/lib files that must move, each flagged runtime|type.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const PKG = resolve('packages/dynamic-forms');
const INTERNAL = join(PKG, 'internal/src/lib');
const MAINLIB = join(PKG, 'src/lib');

function resolveImport(spec, fromFile) {
  if (!spec.startsWith('.')) return null; // external
  const base = resolve(dirname(fromFile), spec);
  const cands = [base + '.ts', join(base, 'index.ts'), base];
  for (const c of cands) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return base + '.ts'; // unresolved guess (will be flagged missing)
}

const IMPORT_RE = /from\s+['"](\.[^'"]+)['"]/g;
function imports(file) {
  if (!existsSync(file)) return [];
  const src = readFileSync(file, 'utf8');
  const out = [];
  let m;
  while ((m = IMPORT_RE.exec(src))) out.push(m[1]);
  return out;
}

function classify(file) {
  if (!existsSync(file)) return 'MISSING';
  const s = readFileSync(file, 'utf8');
  const runtime =
    /@(Component|Directive|Injectable|Pipe|NgModule)\b/.test(s) ||
    /\bexport\s+(async\s+)?function\b/.test(s) ||
    /\bexport\s+class\b/.test(s) ||
    /\bexport\s+const\b/.test(s) ||
    /\bexport\s+(default\s+)?enum\b/.test(s);
  return runtime ? 'runtime' : 'type';
}

function isSpec(f) {
  return f.endsWith('.spec.ts') || f.endsWith('.type-test.ts');
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (p.endsWith('.ts') && !isSpec(p)) acc.push(p);
  }
  return acc;
}

// seed = everything already in internal
const seed = walk(INTERNAL);
const visited = new Set(seed);
const queue = [...seed];
const mustMove = new Map(); // mainlib file -> classification

while (queue.length) {
  const f = queue.shift();
  for (const spec of imports(f)) {
    const target = resolveImport(spec, f);
    if (!target) continue;
    const underInternal = target.startsWith(INTERNAL + '/');
    const underMain = target.startsWith(MAINLIB + '/');
    if (underInternal) {
      if (!visited.has(target)) {
        visited.add(target);
        queue.push(target);
      }
    } else if (underMain) {
      if (!mustMove.has(target)) {
        mustMove.set(target, classify(target));
        // follow its deps too (it will move into internal)
        if (!visited.has(target)) {
          visited.add(target);
          queue.push(target);
        }
      }
    }
    // external -> ignore
  }
}

const rows = [...mustMove.entries()].map(([f, c]) => [relative(MAINLIB, f), c]).sort();

console.log(`\n=== TRUE closure: src/lib files that must ALSO move into /internal ===`);
console.log(
  `total: ${rows.length}  (runtime: ${rows.filter((r) => r[1] === 'runtime').length}, type: ${rows.filter((r) => r[1] === 'type').length}, missing: ${rows.filter((r) => r[1] === 'MISSING').length})\n`,
);

// group by top dir
const byDir = {};
for (const [f, c] of rows) {
  const top = f.split('/').slice(0, 2).join('/');
  (byDir[top] ??= []).push([f, c]);
}
for (const [d, items] of Object.entries(byDir).sort()) {
  console.log(`  ${d}/  (${items.length})`);
  for (const [f, c] of items) console.log(`      ${c === 'runtime' ? 'RUNTIME' : c === 'MISSING' ? 'MISSING' : 'type   '}  ${f}`);
}
