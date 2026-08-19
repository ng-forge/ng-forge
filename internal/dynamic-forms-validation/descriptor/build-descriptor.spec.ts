/**
 * End-to-end descriptor assembly against a real TypeScript program.
 *
 * Covers the two things that must never regress quietly: `wrappers` staying
 * required on `container`, and an unmapped non-serializable type failing for a
 * built-in adapter while degrading for a consumer's.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildDescriptor } from './build-descriptor';
import { serializeDescriptor, acceptedFieldTypeNames, resolveCanonicalName } from './serialize';

const CORE = '@build-test/core';
const ADAPTER = '@build-test/adapter';

const CORE_DTS = `
export declare class Observable<T> { private _o: T; }
export declare class Signal<T> { private _s: T; }
export type DynamicText = string | Observable<string> | Signal<string>;

export interface BaseField { key: string; label?: DynamicText; }
export interface TextField extends BaseField { type: 'text'; }

export interface ContainerField {
  key: string;
  type: 'container';
  readonly fields: readonly BaseField[];
  readonly wrappers: readonly { type: string }[];
}

export interface FieldRegistryLeaves { text: TextField; }
export interface FieldRegistryContainers { container: ContainerField; }
`;

const ADAPTER_DTS = (extra: string) => `
import type { BaseField, DynamicText, Observable } from '${CORE}';

export type AcmeText = string | Observable<string>;
export interface AcmeInputProps { appearance?: 'outline' | 'fill'; hint?: DynamicText; ${extra} }
export interface AcmeInputField extends BaseField { type: 'input'; props?: AcmeInputProps; }
export interface AcmeAddItemField extends BaseField { type: 'add-array-item' | 'addArrayItem'; }

declare module '${CORE}' {
  interface FieldRegistryLeaves {
    input: AcmeInputField;
    addArrayItem: AcmeAddItemField;
    'add-array-item': AcmeAddItemField;
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

async function workspace(name: string, extraProps = '') {
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
  await writeFile(join(dir, 'src', 'index.ts'), 'export const x = 1;\n', 'utf-8');
  await writePackage(dir, CORE, CORE_DTS);
  await writePackage(dir, ADAPTER, ADAPTER_DTS(extraProps));
  return join(dir, 'tsconfig.json');
}

const build = (tsConfigFilePath: string, strictNarrowing = true) =>
  buildDescriptor({
    tsConfigFilePath,
    adapterPackage: ADAPTER,
    corePackage: CORE,
    adapterId: 'acme',
    adapterVersion: '1.0.0',
    generator: { name: 'test', version: '0.0.0' },
    strictNarrowing,
  });

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'ngforge-build-'));
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('buildDescriptor', () => {
  let result: ReturnType<typeof build>;

  beforeAll(async () => {
    result = build(await workspace('ok'));
  });

  it('builds successfully', () => {
    expect(result.ok, result.ok ? '' : result.failure.detail).toBe(true);
  });

  it('carries format version and provenance', () => {
    if (!result.ok) throw new Error('expected success');

    expect(result.descriptor.formatVersion).toBeTruthy();
    expect(result.descriptor.adapter).toEqual({ id: 'acme', package: ADAPTER, version: '1.0.0' });
    expect(result.descriptor.generator.name).toBe('test');
  });

  it('includes core and adapter types, with aliases', () => {
    if (!result.ok) throw new Error('expected success');

    expect(acceptedFieldTypeNames(result.descriptor)).toContain('addArrayItem');
    expect(resolveCanonicalName(result.descriptor, 'addArrayItem')).toBe('add-array-item');
  });

  it('resolves props, including an enum from a literal union', () => {
    if (!result.ok) throw new Error('expected success');

    expect(result.descriptor.fieldTypes['input'].props?.keys['appearance'].type).toEqual({
      kind: 'enum',
      values: ['fill', 'outline'],
    });
  });

  it('narrows DynamicText rather than recording it as unresolved', () => {
    if (!result.ok) throw new Error('expected success');
    const hint = result.descriptor.fieldTypes['input'].props?.keys['hint'];

    expect(hint?.type).toEqual({ kind: 'string' });
    expect(hint?.narrowedFrom).toBe('DynamicText');
    expect(result.descriptor.unresolved.map((u) => u.path)).not.toContain('input.props.hint');
  });

  it('keeps wrappers required on container', () => {
    // The single most important assertion in this file. If wrappers ever reads
    // optional, `container` has become a synonym for `group`, and any schema
    // built from the descriptor would accept a container without chrome.
    if (!result.ok) throw new Error('expected success');
    const wrappers = result.descriptor.fieldTypes['container'].fieldLevel['wrappers'];

    expect(wrappers, 'wrappers must appear in the descriptor').toBeDefined();
    expect(wrappers.required, 'wrappers must stay required').toBe(true);
  });

  it('marks container as a container and text as a leaf', () => {
    if (!result.ok) throw new Error('expected success');

    expect(result.descriptor.fieldTypes['container'].kind).toBe('container');
    expect(result.descriptor.fieldTypes['text'].kind).toBe('leaf');
  });

  it('serialises deterministically', () => {
    if (!result.ok) throw new Error('expected success');

    expect(serializeDescriptor(result.descriptor)).toBe(serializeDescriptor(result.descriptor));
  });
});

describe('narrowing exhaustiveness depends on who owns the adapter', () => {
  it('fails for a built-in adapter when a narrowable type has no entry', async () => {
    // Ours to know. AcmeText mixes a string arm we could keep with an Observable
    // arm we cannot, so omitting a table entry silently stops constraining a
    // property we were able to constrain.
    const result = build(await workspace('strict', 'chrome?: AcmeText;'), true);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.failure.kind).toBe('unmapped-non-serializable');
    expect(result.failure.detail).toContain('AcmeText');
  });

  it('degrades for a consumer adapter instead of failing', async () => {
    // We have never seen their types. Failing here would make custom adapters
    // unusable, which is the entire point of the feature.
    const result = build(await workspace('lenient', 'chrome?: AcmeText;'), false);

    expect(result.ok, result.ok ? '' : result.failure.detail).toBe(true);
    if (!result.ok) return;

    const chrome = result.descriptor.fieldTypes['input'].props?.keys['chrome'];
    expect(chrome?.narrowedFrom).toBe('AcmeText');
    expect(result.descriptor.unresolved.some((u) => u.path === 'input.props.chrome')).toBe(true);
    expect(result.descriptor.unresolved.every((u) => u.fallback === 'passthrough')).toBe(true);
  });

  it('does not fail on a type with no serializable arm at all', async () => {
    // A bare Observable cannot be narrowed to anything, so demanding a table
    // entry would make the gate fire on correct code. Opaque and recorded.
    const result = build(await workspace('bare-runtime', 'stream?: Observable<number>;'), true);

    expect(result.ok, result.ok ? '' : result.failure.detail).toBe(true);
    if (!result.ok) return;

    expect(result.descriptor.fieldTypes['input'].props?.keys['stream'].type.kind).toBe('opaque');
  });
});
