#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const distRoot = 'dist/packages/dynamic-forms';
const schematicsDir = join(distRoot, 'schematics');
const cjsMarker = join(schematicsDir, 'package.json');
const distManifest = join(distRoot, 'package.json');
const npmignore = join(distRoot, '.npmignore');
const workspaceManifest = 'package.json';

// Third-party UI lib install ranges are sourced from the workspace root
// at build time and embedded under `ngForgeSchematicDeps`. The schematic
// reads this field from its own manifest at runtime — no hardcoded values.
const SCHEMATIC_DEPS_KEYS = ['bootstrap', 'primeng', '@primeuix/themes', 'primeicons', '@ionic/angular'];

writeFileSync(cjsMarker, JSON.stringify({ type: 'commonjs' }) + '\n');

if (existsSync(npmignore)) {
  const current = readFileSync(npmignore, 'utf-8');
  const marker = '!schematics/package.json';
  if (!current.includes(marker)) {
    const next = current.endsWith('\n') ? current + marker + '\n' : current + '\n' + marker + '\n';
    writeFileSync(npmignore, next);
  }
}

if (existsSync(distManifest) && existsSync(workspaceManifest)) {
  const dist = JSON.parse(readFileSync(distManifest, 'utf-8'));
  const ws = JSON.parse(readFileSync(workspaceManifest, 'utf-8'));
  const wsAll = { ...(ws.dependencies ?? {}), ...(ws.devDependencies ?? {}) };
  const schematicDeps = {};
  for (const key of SCHEMATIC_DEPS_KEYS) {
    const spec = wsAll[key];
    if (!spec) continue;
    schematicDeps[key] = toInstallRange(spec);
  }
  dist.ngForgeSchematicDeps = schematicDeps;
  writeFileSync(distManifest, JSON.stringify(dist, null, 2) + '\n');
}

function toInstallRange(spec) {
  if (typeof spec !== 'string' || spec.length === 0) return spec;
  if (/^[~^>=<]/.test(spec) || spec.startsWith('git') || spec.startsWith('file:') || spec.startsWith('npm:')) {
    return spec;
  }
  if (/^\d/.test(spec)) return `^${spec}`;
  return spec;
}
