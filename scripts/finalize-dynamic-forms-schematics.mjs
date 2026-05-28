#!/usr/bin/env node
// Post-build step for @ng-forge/dynamic-forms schematics.
//
// 1. Writes dist/packages/dynamic-forms/schematics/package.json with
//    `"type":"commonjs"` so Node loads the compiled .js files as CJS
//    (the parent package.json declares `"type":"module"`).
// 2. Patches dist/packages/dynamic-forms/.npmignore so the CJS marker
//    is NOT stripped from the published tarball — ng-packagr's default
//    .npmignore contains `**/package.json` to drop dev-time secondary
//    entrypoint manifests, which would also drop our CJS marker.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distRoot = 'dist/packages/dynamic-forms';
const schematicsDir = join(distRoot, 'schematics');
const cjsMarker = join(schematicsDir, 'package.json');
const npmignore = join(distRoot, '.npmignore');

writeFileSync(cjsMarker, JSON.stringify({ type: 'commonjs' }) + '\n');

if (existsSync(npmignore)) {
  const current = readFileSync(npmignore, 'utf-8');
  const marker = '!schematics/package.json';
  if (!current.includes(marker)) {
    const next = current.endsWith('\n') ? current + marker + '\n' : current + '\n' + marker + '\n';
    writeFileSync(npmignore, next);
  }
}
