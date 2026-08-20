import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverProject, versionMismatch } from './discover-project.js';

let root: string;

/**
 * A project laid out the way a real one is: a manifest and tsconfig at the top,
 * the forms in a subdirectory, and the library installed in node_modules.
 */
beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'ng-forge-discover-'));

  await mkdir(join(root, 'app', 'src', 'forms'), { recursive: true });
  await mkdir(join(root, 'app', 'node_modules', '@ng-forge', 'dynamic-forms'), { recursive: true });

  await writeFile(
    join(root, 'app', 'package.json'),
    JSON.stringify({
      name: 'consumer',
      dependencies: { '@ng-forge/dynamic-forms': '^1.1.0', '@ng-forge/dynamic-forms-material': '^1.1.0' },
      devDependencies: { '@ng-forge/dynamic-forms-cli': '^1.1.0' },
    }),
    'utf-8',
  );
  await writeFile(join(root, 'app', 'tsconfig.json'), '{}', 'utf-8');
  await writeFile(
    join(root, 'app', 'node_modules', '@ng-forge', 'dynamic-forms', 'package.json'),
    JSON.stringify({ version: '1.0.4' }),
    'utf-8',
  );

  // A parent that must not be picked up once the project is found.
  await writeFile(join(root, 'tsconfig.json'), '{}', 'utf-8');
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('discoverProject', () => {
  it('finds the manifest and tsconfig when run from the project root', async () => {
    const found = await discoverProject({ cwd: join(root, 'app') });

    expect(found.packageJsonPath).toBe(join(root, 'app', 'package.json'));
    expect(found.tsconfigPath).toBe(join(root, 'app', 'tsconfig.json'));
  });

  it('finds them when run from a subdirectory', async () => {
    // An agent runs this wherever the file it is editing happens to be.
    const found = await discoverProject({ cwd: join(root, 'app', 'src', 'forms') });

    expect(found.packageJsonPath).toBe(join(root, 'app', 'package.json'));
    expect(found.tsconfigPath).toBe(join(root, 'app', 'tsconfig.json'));
  });

  it('stops at the project rather than climbing into a parent', async () => {
    const found = await discoverProject({ cwd: join(root, 'app', 'src') });

    expect(found.tsconfigPath).not.toBe(join(root, 'tsconfig.json'));
  });

  it('uses an explicit tsconfig without searching', async () => {
    const found = await discoverProject({ cwd: join(root, 'app'), tsconfig: join(root, 'tsconfig.json') });

    expect(found.tsconfigPath).toBe(join(root, 'tsconfig.json'));
  });

  it('reports the installed version rather than the declared range', async () => {
    // The manifest says ^1.1.0; what is installed is 1.0.4, and only the second
    // tells you which rules apply.
    const found = await discoverProject({ cwd: join(root, 'app') });

    expect(found.libraryVersion).toBe('1.0.4');
  });

  it('lists the adapter packages the project depends on', async () => {
    const found = await discoverProject({ cwd: join(root, 'app') });

    expect(found.adapterPackages).toEqual(['@ng-forge/dynamic-forms-material']);
  });

  it('does not mistake the CLI for an adapter', async () => {
    const found = await discoverProject({ cwd: join(root, 'app') });

    expect(found.adapterPackages).not.toContain('@ng-forge/dynamic-forms-cli');
  });

  it('returns empty rather than throwing outside any project', async () => {
    const bare = await mkdtemp(join(tmpdir(), 'ng-forge-bare-'));

    try {
      const found = await discoverProject({ cwd: bare });
      expect(found.adapterPackages).toEqual([]);
      expect(found.libraryVersion).toBeUndefined();
    } finally {
      await rm(bare, { recursive: true, force: true });
    }
  });
});

describe('versionMismatch', () => {
  // npx fetches the latest CLI unless pinned, so a project several releases
  // behind gets validated against rules it does not have.
  it('warns across majors and says how to pin', () => {
    expect(versionMismatch('2.0.0', '1.4.0')).toMatch(/Different majors/);
    expect(versionMismatch('2.0.0', '1.4.0')).toContain('dynamic-forms-cli@1');
  });

  it('warns across minors, more gently', () => {
    const warning = versionMismatch('1.2.0', '1.0.4');

    expect(warning).toMatch(/Some rules changed/);
    expect(warning).toContain('dynamic-forms-cli@1.0.4');
  });

  it('says nothing when the minor matches', () => {
    expect(versionMismatch('1.1.3', '1.1.0')).toBeUndefined();
  });

  it('says nothing when the library cannot be found', () => {
    // Better silent than a warning about a version we did not read.
    expect(versionMismatch('1.1.0', undefined)).toBeUndefined();
  });
});
