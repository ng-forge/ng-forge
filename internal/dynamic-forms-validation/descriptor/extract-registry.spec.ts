/**
 * Registry resolution against a real TypeScript program.
 *
 * The fixtures are hand-written `.d.ts` packages rather than the built library,
 * so these stay hermetic and fast and can construct failure cases the real
 * packages cannot produce on demand. What they exercise is the genuine
 * mechanism: module augmentation merging across packages resolved from
 * `node_modules`.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { belongsTo, resolveRegistry } from './extract-registry';

const CORE = '@ngforge-test/core';
const ADAPTER = '@ngforge-test/adapter';
const OTHER_ADAPTER = '@ngforge-test/other-adapter';
/**
 * An adapter whose specifier extends core's, the way every real one does:
 * `@ng-forge/dynamic-forms` against `@ng-forge/dynamic-forms-material`.
 */
const PREFIXED_ADAPTER = `${CORE}-extra`;

/** Core package: declares the registries with one built-in type each. */
const CORE_DTS = `
export interface FieldOption<T = unknown> { label: string; value: T; }
export interface BaseField { key: string; label?: string; }
export interface TextField extends BaseField { type: 'text'; }
export interface RowField extends BaseField { type: 'row'; }

export interface SharedProps { base?: 'a' | 'b'; }
export interface SharedField extends BaseField { type: 'shared'; props?: SharedProps; }

export interface FieldRegistryLeaves { text: TextField; shared: SharedField; }
export interface FieldRegistryContainers { row: RowField; }
`;

/** Adapter package: augments the core registries, as a real adapter does. */
const ADAPTER_DTS = (target: string) => `
import type { BaseField } from '${CORE}';

export interface InputProps { placeholder?: string; }
export interface AcmeInputProps extends InputProps { appearance?: 'fill' | 'outline'; }
export interface AcmeInputField extends BaseField { type: 'input'; props?: AcmeInputProps; }

/** Declares both spellings, exactly as the real array actions do. */
export interface AcmeAddItemField extends BaseField { type: 'add-array-item' | 'addArrayItem'; }

declare module '${target}' {
  interface FieldRegistryLeaves {
    input: AcmeInputField;
    addArrayItem: AcmeAddItemField;
    'add-array-item': AcmeAddItemField;
  }
}
`;

/**
 * A second adapter declaring the SAME registry key with different props.
 *
 * `declare module` merges globally, so with both installed the checker holds one
 * merged `FieldRegistryLeaves` and resolving `input` from it yields whichever
 * declaration it picked, not the one belonging to the adapter we asked for.
 */
const OTHER_ADAPTER_DTS = `
import type { BaseField } from '${CORE}';

export interface OtherInputProps { spacing?: 'tight' | 'loose'; }
export interface OtherInputField extends BaseField { type: 'input'; props?: OtherInputProps; }
export interface OtherOnlyField extends BaseField { type: 'other-input'; props?: OtherInputProps; }

declare module '${CORE}' {
  interface FieldRegistryLeaves {
    input: OtherInputField;
    'other-input': OtherOnlyField;
  }
}
`;

/**
 * A third adapter that re-declares a key core owns.
 *
 * Its specifier starts with core's, so a substring test reads its files as
 * core's. `shared` is the fixture for the core fallback specifically: the
 * requested adapter declares nothing for it, so resolution reaches the core
 * branch, and a boundary-blind match answers with this package instead of core.
 */
const PREFIXED_ADAPTER_DTS = `
import type { BaseField } from '${CORE}';

export interface PrefixedSharedProps { tone?: 'warm' | 'cool'; }
export interface PrefixedSharedField extends BaseField { type: 'shared'; props?: PrefixedSharedProps; }

declare module '${CORE}' {
  interface FieldRegistryLeaves {
    shared: PrefixedSharedField;
  }
}
`;

let root: string;

async function writePackage(dir: string, name: string, dts: string) {
  const pkgDir = join(dir, 'node_modules', ...name.split('/'));
  await mkdir(pkgDir, { recursive: true });
  await writeFile(join(pkgDir, 'package.json'), JSON.stringify({ name, version: '1.0.0', types: './index.d.ts' }), 'utf-8');
  await writeFile(join(pkgDir, 'index.d.ts'), dts, 'utf-8');
}

/**
 * @param augmentationTarget which module the adapter augments. Pointing it at a
 * specifier that resolves to nothing reproduces the silent-partial failure:
 * the adapter loads, and merges nothing.
 */
async function workspace(
  name: string,
  opts: { withAdapter?: boolean; augmentationTarget?: string; withSecondAdapter?: boolean; withPrefixedAdapter?: boolean } = {},
) {
  const dir = join(root, name);
  await mkdir(join(dir, 'src'), { recursive: true });

  await writeFile(
    join(dir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', strict: true, skipLibCheck: true, types: [] },
      include: ['src/**/*.ts'],
    }),
    'utf-8',
  );
  await writeFile(join(dir, 'src', 'index.ts'), 'export const placeholder = 1;\n', 'utf-8');

  await writePackage(dir, CORE, CORE_DTS);
  if (opts.withAdapter !== false) {
    await writePackage(dir, ADAPTER, ADAPTER_DTS(opts.augmentationTarget ?? CORE));
  }
  if (opts.withSecondAdapter) {
    await writePackage(dir, OTHER_ADAPTER, OTHER_ADAPTER_DTS);
    // The consumer's own code pulls both in, which is what makes the merge
    // unavoidable: importing only the requested adapter in a probe is too late.
    await writeFile(join(dir, 'src', 'app.ts'), `import '${ADAPTER}';\nimport '${OTHER_ADAPTER}';\n`, 'utf-8');
  }
  if (opts.withPrefixedAdapter) {
    await writePackage(dir, PREFIXED_ADAPTER, PREFIXED_ADAPTER_DTS);
    await writeFile(join(dir, 'src', 'app.ts'), `import '${ADAPTER}';\nimport '${PREFIXED_ADAPTER}';\n`, 'utf-8');
  }

  return join(dir, 'tsconfig.json');
}

const resolve = (tsConfigFilePath: string) => resolveRegistry({ tsConfigFilePath, adapterPackage: ADAPTER, corePackage: CORE });

/**
 * Resolve one adapter's registry, failing with the reason rather than a bare
 * undefined further down.
 */
function resolveOrThrow(tsConfigFilePath: string, adapterPackage: string) {
  const result = resolveRegistry({ tsConfigFilePath, adapterPackage, corePackage: CORE });
  if (!result.ok) throw new Error(result.failure.detail);
  return result;
}

/** Sorted prop names of one entry, so a shape can be compared by value. */
function propNames(result: ReturnType<typeof resolveOrThrow>, canonical: string): string[] {
  const entry = result.entries.find((e) => e.canonical === canonical);
  const props = entry?.type.getProperty('props')?.getTypeAtLocation(entry.at)?.getNonNullableType();
  return (props?.getProperties() ?? []).map((p) => p.getName()).sort();
}

/**
 * Building a TypeScript program takes seconds, so every describe below resolves
 * once per adapter in `beforeAll` and asserts against the result.
 *
 * This is not only about speed. Three tests asking the same two questions ran
 * four programs, and the one that asked twice in a single test took 7972ms on a
 * CI runner against vitest's 5000ms default and timed out. The work belongs in
 * the hook, where the budget is stated rather than inherited.
 */
const PROGRAM_BUDGET_MS = 30_000;

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'ngforge-registry-'));
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('resolveRegistry, happy path', () => {
  let result: ReturnType<typeof resolve>;

  beforeAll(async () => {
    result = resolve(await workspace('ok'));
  });

  it('resolves the merged registry through node_modules', () => {
    expect(result.ok, result.ok ? '' : result.failure.detail).toBe(true);
  });

  it('finds core and adapter leaf types together', () => {
    if (!result.ok) throw new Error('expected success');
    const names = result.entries.map((e) => e.canonical);

    expect(names).toContain('text');
    expect(names).toContain('input');
  });

  it('finds container types', () => {
    if (!result.ok) throw new Error('expected success');
    const row = result.entries.find((e) => e.canonical === 'row');

    expect(row?.kind).toBe('container');
  });

  it('collapses both spellings of an array action into one entry', () => {
    if (!result.ok) throw new Error('expected success');
    const matches = result.entries.filter((e) => e.canonical.includes('add') || e.aliases.some((a) => a.includes('add')));

    expect(matches).toHaveLength(1);
  });

  it('picks the kebab-case spelling as canonical, matching runtime normalisation', () => {
    if (!result.ok) throw new Error('expected success');
    const entry = result.entries.find((e) => e.canonical === 'add-array-item');

    expect(entry, 'kebab spelling should be canonical').toBeDefined();
    expect(entry?.aliases).toContain('addArrayItem');
  });

  it('never lists the canonical name among its own aliases', () => {
    if (!result.ok) throw new Error('expected success');
    for (const entry of result.entries) {
      expect(entry.aliases, `${entry.canonical} aliases itself`).not.toContain(entry.canonical);
    }
  });

  it('returns entries in a deterministic order', () => {
    if (!result.ok) throw new Error('expected success');
    const names = result.entries.map((e) => e.canonical);

    expect(names).toEqual([...names].sort());
  });

  it('computes a dependency closure that includes the adapter declarations', () => {
    if (!result.ok) throw new Error('expected success');

    expect(result.closure.length).toBeGreaterThan(0);
    expect(result.closure.some((f) => f.includes('adapter'))).toBe(true);
  });
});

describe('adapter isolation when several adapters are installed', () => {
  // Installing more than one adapter is normal: demos, an in-progress migration,
  // a shared library supporting several. The descriptor must describe the one
  // that was asked for, not whichever declaration the checker happened to merge.
  let requested: string[];
  let other: string[];

  beforeAll(async () => {
    const tsConfigFilePath = await workspace('two-adapters', { withSecondAdapter: true });

    requested = propNames(resolveOrThrow(tsConfigFilePath, ADAPTER), 'input');
    other = propNames(resolveOrThrow(tsConfigFilePath, OTHER_ADAPTER), 'input');
  }, PROGRAM_BUDGET_MS);

  it('returns the requested adapter own props', () => {
    // `appearance` is its own; `placeholder` is inherited from InputProps.
    expect(requested).toEqual(['appearance', 'placeholder']);
  });

  it('returns the other adapter own props when that one is requested', () => {
    expect(other).toEqual(['spacing']);
  });

  it('does not return the same shape for two different adapters', () => {
    expect(requested).not.toEqual(other);
  });
});

describe('an adapter whose name extends core name', () => {
  // The real packages are shaped exactly like this: `@ng-forge/dynamic-forms` is
  // a strict prefix of `@ng-forge/dynamic-forms-material`. Matching a package by
  // bare substring therefore reads every adapter file as core, and the core
  // fallback hands back another adapter's declaration for any key the requested
  // adapter does not declare. It bites where packages resolve from node_modules,
  // which is the consumer path this feature exists for.
  let sharedForRequested: string[];
  let sharedForPrefixed: string[];
  let canonicalForRequested: string[];

  beforeAll(async () => {
    const tsConfigFilePath = await workspace('prefixed-adapter', { withPrefixedAdapter: true });

    const forRequested = resolveOrThrow(tsConfigFilePath, ADAPTER);
    const forPrefixed = resolveOrThrow(tsConfigFilePath, PREFIXED_ADAPTER);

    sharedForRequested = propNames(forRequested, 'shared');
    sharedForPrefixed = propNames(forPrefixed, 'shared');
    canonicalForRequested = forRequested.entries.map((e) => e.canonical);
  }, PROGRAM_BUDGET_MS);

  it('falls back to core, not to the adapter that merely shares its prefix', () => {
    // The requested adapter says nothing about `shared`, so this goes through the
    // core branch. Unbounded, that branch matched the prefixed adapter and
    // published its `tone` as core's shape for every adapter.
    expect(sharedForRequested, 'a foreign adapter props were attributed to core').toEqual(['base']);
  });

  it('still resolves the requested adapter own types', () => {
    expect(canonicalForRequested).toContain('input');
  });

  it('describes the prefixed adapter own shape when it is the one requested', () => {
    expect(sharedForPrefixed).toEqual(['tone']);
  });
});

describe('a field type only another adapter declares', () => {
  // `declare module` merges globally, so a consumer with two adapters installed
  // has both adapters' keys in one registry. Answering for a key the requested
  // adapter never declared published the other adapter's field as this one's.
  let names: string[];

  beforeAll(async () => {
    const tsConfigFilePath = await workspace('foreign-key', { withSecondAdapter: true });
    names = resolveOrThrow(tsConfigFilePath, ADAPTER).entries.map((e) => e.canonical);
  }, PROGRAM_BUDGET_MS);

  it('is left out of the requested adapter registry', () => {
    // `other-input` is declared by the other adapter alone. Core does not know
    // it and neither does the adapter being described, so it is not ours.
    expect(names, 'a foreign adapter field type leaked into the registry').not.toContain('other-input');
  });

  it('still carries core and the requested adapter own types', () => {
    expect(names).toContain('text');
    expect(names).toContain('input');
  });
});

describe('belongsTo', () => {
  // Tested directly. Whether the collision fires through resolveRegistry depends
  // on the order the checker happens to return declarations in, which is not
  // something a fixture can pin down; the predicate is, and it is the thing that
  // was wrong.
  const core = '@ng-forge/dynamic-forms';

  it('does not read an adapter path as the core package', () => {
    expect(belongsTo('/p/node_modules/@ng-forge/dynamic-forms-ionic/index.d.ts', core)).toBe(false);
  });

  it('still reads a real core path as core', () => {
    expect(belongsTo('/p/node_modules/@ng-forge/dynamic-forms/index.d.ts', core)).toBe(true);
  });

  it('matches a package directory with nothing after it', () => {
    expect(belongsTo('/p/node_modules/@ng-forge/dynamic-forms', core)).toBe(true);
  });

  it('matches the adapter itself by its own specifier', () => {
    const ionic = '@ng-forge/dynamic-forms-ionic';
    expect(belongsTo('/p/node_modules/@ng-forge/dynamic-forms-ionic/index.d.ts', ionic)).toBe(true);
  });

  it('applies the same boundary to a source root given without a trailing slash', () => {
    expect(belongsTo('/p/packages/dynamic-forms-material/src/x.ts', '@acme/none', 'packages/dynamic-forms')).toBe(false);
    expect(belongsTo('/p/packages/dynamic-forms/src/x.ts', '@acme/none', 'packages/dynamic-forms')).toBe(true);
  });
});

describe('resolveRegistry, failure modes', () => {
  // Each of these builds its own workspace and program, so they carry the same
  // stated budget as the hooks above. The slowest measured 4370ms on CI against
  // vitest's 5000ms default, which is not headroom worth relying on.
  it(
    'fails clearly when the adapter is not installed',
    async () => {
      const result = resolve(await workspace('no-adapter', { withAdapter: false }));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.failure.kind).toBe('adapter-not-resolved');
      expect(result.failure.detail).toContain('Is it installed?');
    },
    PROGRAM_BUDGET_MS,
  );

  it(
    'fails when the adapter loads but its augmentation merges nothing',
    async () => {
      // The trap found in the phase 1a spike: everything resolves, no error is
      // raised anywhere, and only core types come back. Returning that as success
      // would ship a descriptor that validates almost nothing while looking clean.
      const result = resolve(await workspace('bad-augment', { augmentationTarget: '@ngforge-test/core-typo' }));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.failure.kind).toBe('adapter-contributed-nothing');
      expect(result.failure.detail).toContain('did not merge');
    },
    PROGRAM_BUDGET_MS,
  );

  it(
    'does not mistake a working adapter for a non-contributing one',
    async () => {
      const result = resolve(await workspace('control'));
      expect(result.ok).toBe(true);
    },
    PROGRAM_BUDGET_MS,
  );
});
