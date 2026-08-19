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
import { resolveRegistry } from './extract-registry';

const CORE = '@ngforge-test/core';
const ADAPTER = '@ngforge-test/adapter';
const OTHER_ADAPTER = '@ngforge-test/other-adapter';

/** Core package: declares the registries with one built-in type each. */
const CORE_DTS = `
export interface FieldOption<T = unknown> { label: string; value: T; }
export interface BaseField { key: string; label?: string; }
export interface TextField extends BaseField { type: 'text'; }
export interface RowField extends BaseField { type: 'row'; }

export interface FieldRegistryLeaves { text: TextField; }
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

declare module '${CORE}' {
  interface FieldRegistryLeaves {
    input: OtherInputField;
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
async function workspace(name: string, opts: { withAdapter?: boolean; augmentationTarget?: string; withSecondAdapter?: boolean } = {}) {
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

  return join(dir, 'tsconfig.json');
}

const resolve = (tsConfigFilePath: string) => resolveRegistry({ tsConfigFilePath, adapterPackage: ADAPTER, corePackage: CORE });

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
  let tsConfigFilePath: string;

  beforeAll(async () => {
    tsConfigFilePath = await workspace('two-adapters', { withSecondAdapter: true });
  });

  function propsOf(adapterPackage: string) {
    const result = resolveRegistry({ tsConfigFilePath, adapterPackage, corePackage: CORE });
    if (!result.ok) throw new Error(result.failure.detail);

    const input = result.entries.find((e) => e.canonical === 'input');
    const props = input?.type.getProperty('props')?.getTypeAtLocation(input.at)?.getNonNullableType();
    return (props?.getProperties() ?? []).map((p) => p.getName()).sort();
  }

  it('returns the requested adapter own props', () => {
    // `appearance` is its own; `placeholder` is inherited from InputProps.
    expect(propsOf(ADAPTER)).toEqual(['appearance', 'placeholder']);
  });

  it('returns the other adapter own props when that one is requested', () => {
    expect(propsOf(OTHER_ADAPTER)).toEqual(['spacing']);
  });

  it('does not return the same shape for two different adapters', () => {
    expect(propsOf(ADAPTER)).not.toEqual(propsOf(OTHER_ADAPTER));
  });
});

describe('resolveRegistry, failure modes', () => {
  it('fails clearly when the adapter is not installed', async () => {
    const result = resolve(await workspace('no-adapter', { withAdapter: false }));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failure.kind).toBe('adapter-not-resolved');
    expect(result.failure.detail).toContain('Is it installed?');
  });

  it('fails when the adapter loads but its augmentation merges nothing', async () => {
    // The trap found in the phase 1a spike: everything resolves, no error is
    // raised anywhere, and only core types come back. Returning that as success
    // would ship a descriptor that validates almost nothing while looking clean.
    const result = resolve(await workspace('bad-augment', { augmentationTarget: '@ngforge-test/core-typo' }));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failure.kind).toBe('adapter-contributed-nothing');
    expect(result.failure.detail).toContain('did not merge');
  });

  it('does not mistake a working adapter for a non-contributing one', async () => {
    const result = resolve(await workspace('control'));
    expect(result.ok).toBe(true);
  });
});
