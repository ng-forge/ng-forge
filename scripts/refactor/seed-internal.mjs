#!/usr/bin/env node
/**
 * Seed the /internal entrypoint with the intended kernel roots, then expand-internal
 * pulls their transitive closure. Run from repo root. --write to apply.
 *
 * Seed = the symbols both consumer + adapter tiers share: config types (models),
 * mappers, field definitions, errors, the shared DI tokens/services, and low-level utils.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';

const PKG = resolve('packages/dynamic-forms');
const SRC = join(PKG, 'src/lib');
const INT = join(PKG, 'internal/src/lib');
const WRITE = process.argv.includes('--write');

// whole-dir seed moves
const DIRS = ['models', 'mappers', 'definitions', 'errors', 'utils/grid-classes', 'utils/dynamic-value'];
// single-file seed moves (+ .spec/.type-test companions)
const FILES = ['core/registry/root-form-registry.service', 'utils/object-utils', 'utils/apply-meta', 'utils/interpolate-params'];

let n = 0;
for (const d of DIRS) {
  const from = join(SRC, d);
  if (!existsSync(from)) {
    console.log(`skip dir (absent): ${d}`);
    continue;
  }
  const to = join(INT, d);
  console.log(`${WRITE ? 'mv' : 'would-mv'} DIR  ${d}`);
  if (WRITE) {
    mkdirSync(dirname(to), { recursive: true });
    execSync(`git mv "${from}" "${to}"`, { stdio: 'pipe' });
    n++;
  }
}
for (const f of FILES) {
  for (const ext of ['.ts', '.spec.ts', '.type-test.ts']) {
    const from = join(SRC, f + ext);
    if (!existsSync(from)) continue;
    const to = join(INT, f + ext);
    console.log(`${WRITE ? 'mv' : 'would-mv'} FILE ${f + ext}`);
    if (WRITE) {
      mkdirSync(dirname(to), { recursive: true });
      execSync(`git mv "${from}" "${to}"`, { stdio: 'pipe' });
      n++;
    }
  }
}
console.log(`\n${WRITE ? 'seeded' : 'would seed'} ${n} moves`);
