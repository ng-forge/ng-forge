#!/usr/bin/env node
/**
 * Fix the "internal has circular dependency on itself" error: some files inside
 * internal/src/lib import from '@ng-forge/dynamic-forms/internal' (created when the
 * codemod rewrote a file before it was moved into internal). Rewrite each such
 * barrel import to direct RELATIVE imports to the files that define the symbols.
 *
 * DRY by default; --write to apply.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';

const PKG = resolve('packages/dynamic-forms');
const LIB = join(PKG, 'internal/src/lib');
const WRITE = process.argv.includes('--write');
const SPEC = '@ng-forge/dynamic-forms/internal';

const isSkip = (f) => f.endsWith('.spec.ts') || f.endsWith('.type-test.ts');
const walk = (d, a = []) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, a) : p.endsWith('.ts') && !isSkip(p) && a.push(p);
  }
  return a;
};
const files = walk(LIB);

// ---- build symbol -> defining file map ----
const DECL =
  /\bexport\s+(?:declare\s+)?(?:abstract\s+)?(?:const|let|var|function|async\s+function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g;
const NAMED_LOCAL = /\bexport\s*\{([^}]*)\}(?!\s*from)/g; // export { a, b as c }
const NAMED_FROM = /\bexport\s*\{([^}]*)\}\s*from\s*['"](\.[^'"]+)['"]/g; // export {a} from './x'
const STAR_FROM = /\bexport\s*\*\s*from\s*['"](\.[^'"]+)['"]/g; // export * from './x'

const resolveRel = (spec, from) => {
  const base = resolve(dirname(from), spec);
  for (const c of [base + '.ts', join(base, 'index.ts')]) if (existsSync(c)) return c;
  return null;
};
const cleanNames = (s) =>
  s
    .split(',')
    .map((x) =>
      x
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .pop()
        .trim(),
    )
    .filter(Boolean);

const map = new Map(); // symbol -> file (first definition wins; direct decls preferred)
const addStar = []; // [{file, target}]
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  let m;
  while ((m = DECL.exec(src))) if (!map.has(m[1])) map.set(m[1], f);
  while ((m = NAMED_LOCAL.exec(src))) for (const n of cleanNames(m[1])) if (!map.has(n)) map.set(n, f);
  while ((m = NAMED_FROM.exec(src))) {
    const t = resolveRel(m[2], f);
    if (t) for (const n of cleanNames(m[1])) if (!map.has(n)) map.set(n, t);
  }
  while ((m = STAR_FROM.exec(src))) {
    const t = resolveRel(m[1], f);
    if (t) addStar.push({ from: f, target: t });
  }
}
// resolve star re-exports: a symbol available via `export * from target` maps to target
// (only fills gaps not already mapped directly)
for (const { target } of addStar) {
  const src = readFileSync(target, 'utf8');
  let m;
  while ((m = DECL.exec(src))) if (!map.has(m[1])) map.set(m[1], target);
  while ((m = NAMED_LOCAL.exec(src))) for (const n of cleanNames(m[1])) if (!map.has(n)) map.set(n, target);
}

// ---- rewrite self-imports ----
const IMP = /\bimport\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]@ng-forge\/dynamic-forms\/internal['"]\s*;?/g;
const relPath = (fromFile, toFile) => {
  let p = relative(dirname(fromFile), toFile)
    .replace(/\.ts$/, '')
    .replace(/\/index$/, '');
  if (!p.startsWith('.')) p = './' + p;
  return p;
};

let filesChanged = 0,
  unresolved = [];
for (const f of files) {
  let src = readFileSync(f, 'utf8');
  if (!src.includes(SPEC)) continue;
  let changed = false;
  src = src.replace(IMP, (full, typeKw, body) => {
    const items = body
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const byFile = new Map();
    const keep = [];
    for (const it of items) {
      const isType = /^type\s+/.test(it);
      const name = it
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        .trim();
      const target = map.get(name);
      if (!target || target === f) {
        keep.push(it);
        unresolved.push(`${relative(PKG, f)}: ${name}`);
        continue;
      }
      const rp = relPath(f, target);
      if (!byFile.has(rp)) byFile.set(rp, []);
      byFile.get(rp).push((typeKw || isType ? '' : '') + it); // preserve inline `type` per item
    }
    const lines = [];
    for (const [rp, its] of byFile) lines.push(`import ${typeKw ? 'type ' : ''}{ ${its.join(', ')} } from '${rp}';`);
    if (keep.length) lines.push(`import ${typeKw ? 'type ' : ''}{ ${keep.join(', ')} } from '${SPEC}';`);
    changed = true;
    return lines.join('\n');
  });
  if (changed) {
    filesChanged++;
    if (WRITE) writeFileSync(f, src);
  }
}

console.log(`fix-self-imports ${WRITE ? 'WRITE' : 'DRY'}: files=${filesChanged} symbolsMapped=${map.size} unresolved=${unresolved.length}`);
if (unresolved.length) for (const u of unresolved.slice(0, 20)) console.log('  UNRESOLVED ' + u);
