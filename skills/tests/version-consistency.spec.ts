/**
 * The version-anchor check has to be right, because a false pass ships a
 * release whose skill describes the previous one.
 */

import { describe, it, expect } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findViolations } from '../../scripts/check-version-consistency.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('version consistency', () => {
  it('passes against the committed tree', async () => {
    const { violations } = await findViolations();
    expect(violations).toEqual([]);
  });

  it('reports the canonical version from the core package', async () => {
    const pkg = JSON.parse(await readFile(join(ROOT, 'packages', 'dynamic-forms', 'package.json'), 'utf-8'));
    const { canonical } = await findViolations();
    expect(canonical).toBe(pkg.version);
  });

  it('covers every package under packages/', async () => {
    // A new package must not slip past the check by simply existing.
    const entries = await readdir(join(ROOT, 'packages'), { withFileTypes: true });
    const packageDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    const { canonical } = await findViolations();

    for (const dir of packageDirs) {
      const pkg = JSON.parse(await readFile(join(ROOT, 'packages', dir, 'package.json'), 'utf-8'));
      expect(pkg.version, `packages/${dir} is not on the release version`).toBe(canonical);
    }
  });

  it('keeps every intra-workspace dependency range on the release version', async () => {
    const entries = await readdir(join(ROOT, 'packages'), { withFileTypes: true });
    const { canonical } = await findViolations();

    for (const entry of entries.filter((e) => e.isDirectory())) {
      const pkg = JSON.parse(await readFile(join(ROOT, 'packages', entry.name, 'package.json'), 'utf-8'));

      for (const block of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
        for (const [name, range] of Object.entries((pkg[block] ?? {}) as Record<string, string>)) {
          if (!name.startsWith('@ng-forge/')) continue;
          expect(range.replace(/^[\^~]/, ''), `${entry.name} ${block}.${name}`).toBe(canonical);
        }
      }
    }
  });

  it('agrees with the version stated in the generated skill', async () => {
    const { canonical } = await findViolations();
    const skill = await readFile(join(ROOT, 'skills', 'dynamic-forms', 'SKILL.md'), 'utf-8');

    expect(skill).toContain(`version **${canonical}**`);
  });
});
