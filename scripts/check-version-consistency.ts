#!/usr/bin/env node
/**
 * Fails when anything that carries the library version has drifted.
 *
 * The packages are released together at one version, and several files repeat
 * that version outside their own manifest: the generated skill states which
 * release it documents, and the MCP server pins its sibling packages. A bump
 * that misses any of them ships a package claiming to be something it is not,
 * or a skill describing rules from the previous release.
 *
 * `skills:check` already fails on a version bump, but only as "this generated
 * file is stale", which does not say why. This says why, and covers the
 * package-to-package agreement that the skill check never looks at.
 *
 * Usage: node scripts/check-version-consistency.ts
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The manifest whose version every other anchor must agree with. */
const CANONICAL_MANIFEST = join('packages', 'dynamic-forms', 'package.json');

/**
 * Internal libraries versioned in lockstep with the release even though they
 * are never published. Keeping them aligned avoids a confusing mismatch when
 * reading the tree.
 */
const LOCKSTEP_INTERNAL = [join('internal', 'dynamic-forms-validation', 'package.json')];

export interface Violation {
  file: string;
  detail: string;
}

async function readJson(path: string): Promise<Record<string, unknown> | undefined> {
  try {
    return JSON.parse(await readFile(join(ROOT, path), 'utf-8'));
  } catch {
    // A directory under packages/ without a manifest is worth reporting
    // cleanly rather than crashing the check with ENOENT.
    return undefined;
  }
}

/** Every workspace manifest that must state the canonical version. */
async function versionedManifests(): Promise<string[]> {
  const packages = await readdir(join(ROOT, 'packages'), { withFileTypes: true });
  return [...packages.filter((e) => e.isDirectory()).map((e) => join('packages', e.name, 'package.json')), ...LOCKSTEP_INTERNAL];
}

export async function findViolations(): Promise<{ canonical: string; violations: Violation[] }> {
  const canonicalPkg = await readJson(CANONICAL_MANIFEST);
  if (!canonicalPkg) {
    throw new Error(`${CANONICAL_MANIFEST} is missing; there is no version to compare against.`);
  }
  const canonical = String(canonicalPkg.version);
  const violations: Violation[] = [];

  for (const manifest of await versionedManifests()) {
    const pkg = await readJson(manifest);

    if (!pkg) {
      violations.push({ file: manifest, detail: 'no package.json found' });
      continue;
    }

    if (pkg.version !== canonical) {
      violations.push({ file: manifest, detail: `version is ${pkg.version}, expected ${canonical}` });
    }

    // Intra-workspace ranges track the release, so `^1.1.0` must not survive a
    // bump to 1.2.0. Checked across every dependency block, since the MCP
    // server keeps its siblings in devDependencies.
    for (const block of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
      const deps = (pkg[block] ?? {}) as Record<string, string>;

      for (const [name, range] of Object.entries(deps)) {
        if (!name.startsWith('@ng-forge/')) continue;

        // Only simple pins track the release. A compound range (`>=`, `||`) or a
        // workspace protocol is a deliberate choice, not a stale bump, so
        // reporting it as "expected 1.1.0" would be wrong.
        const simple = /^[\^~]?(\d+\.\d+\.\d+)$/.exec(range);
        if (!simple) continue;

        if (simple[1] !== canonical) {
          violations.push({ file: manifest, detail: `${block}.${name} is ${range}, expected ${canonical}` });
        }
      }
    }
  }

  // The generated skill states the release it documents, in prose an agent reads.
  //
  // Anchored on that one sentence rather than every semver in the file. Scanning
  // for any `x.y.z` meant a skill mentioning an Angular version or a peer range
  // failed the build with "states 22.0.0, expected 1.1.0". The generator injects
  // this version everywhere it appears, so the other mentions cannot drift from
  // this one independently.
  const skillPath = join('skills', 'dynamic-forms', 'SKILL.md');
  const skill = await readFile(join(ROOT, skillPath), 'utf-8');
  const stated = /documents version \*\*(\d+\.\d+\.\d+)\*\*/.exec(skill);

  if (!stated) {
    violations.push({ file: skillPath, detail: 'does not state which release it documents' });
  } else if (stated[1] !== canonical) {
    violations.push({ file: skillPath, detail: `states ${stated[1]}, expected ${canonical}` });
  }

  return { canonical, violations };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { canonical, violations } = await findViolations();

  if (violations.length > 0) {
    console.error(`[version-check] FAIL: ${violations.length} anchor(s) disagree with ${CANONICAL_MANIFEST} (${canonical}):`);
    for (const { file, detail } of violations) {
      console.error(`  - ${file}: ${detail}`);
    }
    console.error('\nBump every package together, then run: nx run skills:update');
    process.exitCode = 1;
  } else {
    console.log(`[version-check] OK: every version anchor agrees on ${canonical}.`);
  }
}
