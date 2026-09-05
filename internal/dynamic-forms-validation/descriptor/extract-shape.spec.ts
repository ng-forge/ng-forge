/**
 * Shape extraction, against a real TypeScript program.
 *
 * Fixtures are hand-written `.d.ts` packages so these stay hermetic, but the
 * mechanism exercised is genuine: module augmentation merged across packages
 * resolved from node_modules, then read through the checker.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Project, type Node, type Type } from 'ts-morph';
import { describeFieldLevel, describeProps, describeStructural, type ShapeContext } from './extract-shape';
import { NARROWING_TABLE, isNarrowingCandidate, unmappedNarrowingCandidates } from './narrowing';

const CORE = '@shape-test/core';

const CORE_DTS = `
export type DynamicText = string | Observable<string> | Signal<string>;
export declare class Observable<T> { private _o: T; }
export declare class Signal<T> { private _s: T; }

export interface FieldOption<T = unknown> { label: DynamicText; value: T; disabled?: boolean; }

export interface BaseField {
  key: string;
  label?: DynamicText;
  required?: boolean;
  tabIndex?: number;
}

export interface InputProps { placeholder?: string; }
export interface AcmeInputProps extends InputProps {
  appearance?: 'fill' | 'outline';
  hint?: DynamicText;
  density?: -1 | 0 | 1;
  onBlur?: (value: string) => void;
}

export interface AcmeInputField extends BaseField { type: 'input'; props?: AcmeInputProps; }

/** options is FIELD level; props is empty. The pitfall, expressed as a type. */
export interface AcmeSelectField extends BaseField {
  type: 'select';
  readonly options: readonly FieldOption<unknown>[];
  props?: object;
}

/** A field, or a list of fields: primitive array item vs object array item. */
export type AcmeItemDefinition = AcmeInputField | AcmeSelectField | readonly (AcmeInputField | AcmeSelectField)[];

export interface AcmeArrayField {
  key: string;
  type: 'array';
  readonly fields: readonly AcmeItemDefinition[];
}

/** wrappers is REQUIRED. That requirement is the whole type. */
export interface AcmeContainerField {
  key: string;
  type: 'container';
  readonly fields: readonly BaseField[];
  readonly wrappers: readonly { type: string }[];
  readonly label?: never;
}

export interface FieldRegistryLeaves {
  input: AcmeInputField;
  select: AcmeSelectField;
  container: AcmeContainerField;
  array: AcmeArrayField;
}
`;

let root: string;
let project: Project;
let at: Node;
let members: Map<string, Type>;

function context(path: string): ShapeContext {
  return { path, unresolved: [], encountered: new Set() };
}

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), 'ngforge-shape-'));
  const pkgDir = join(root, 'node_modules', ...CORE.split('/'));
  await mkdir(pkgDir, { recursive: true });
  await writeFile(join(pkgDir, 'package.json'), JSON.stringify({ name: CORE, version: '1.0.0', types: './index.d.ts' }), 'utf-8');
  await writeFile(join(pkgDir, 'index.d.ts'), CORE_DTS, 'utf-8');

  await mkdir(join(root, 'src'), { recursive: true });
  await writeFile(
    join(root, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', strict: true, skipLibCheck: true, types: [] },
      include: ['src/**/*.ts'],
    }),
    'utf-8',
  );
  await writeFile(join(root, 'src', 'index.ts'), 'export const x = 1;\n', 'utf-8');

  project = new Project({ tsConfigFilePath: join(root, 'tsconfig.json') });
  const probe = project.createSourceFile(
    join(root, 'src', '__probe.ts'),
    `import type { FieldRegistryLeaves } from '${CORE}';\nexport declare const p: FieldRegistryLeaves;\n`,
    { overwrite: true },
  );
  const decl = probe.getVariableDeclarationOrThrow('p');
  at = decl;
  members = new Map(
    decl
      .getType()
      .getProperties()
      .map((m) => [m.getName(), m.getTypeAtLocation(decl)]),
  );
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('field-level properties', () => {
  it('flattens inherited base-field keys', () => {
    const ctx = context('input');
    const fieldLevel = describeFieldLevel(members.get('input')!, at, ctx);

    expect(Object.keys(fieldLevel).sort()).toEqual(['key', 'label', 'required', 'tabIndex', 'type']);
  });

  it('records required versus optional', () => {
    const fieldLevel = describeFieldLevel(members.get('input')!, at, context('input'));

    expect(fieldLevel['key'].required).toBe(true);
    expect(fieldLevel['label'].required).toBe(false);
  });

  it('puts select options at field level, not in props', () => {
    // The single most-taught pitfall, derived structurally rather than written down.
    const ctx = context('select');
    const fieldLevel = describeFieldLevel(members.get('select')!, at, ctx);
    const props = describeProps(members.get('select')!, at, ctx);

    expect(fieldLevel['options'], 'options must be field level').toBeDefined();
    expect(fieldLevel['options'].required).toBe(true);
    expect(Object.keys(props?.keys ?? {}), 'select props should be empty').toEqual([]);
  });

  it('describes an options array as an array of a referenced object', () => {
    const fieldLevel = describeFieldLevel(members.get('select')!, at, context('select'));

    expect(fieldLevel['options'].type.kind).toBe('array');
  });

  it('records a never key as forbidden rather than dropping it', () => {
    // `label?: never` on a container is a rule the validator enforces, and one
    // of the mistakes agents make most often. Omitting it would let a schema
    // derived from this descriptor accept a label on a container.
    const fieldLevel = describeFieldLevel(members.get('container')!, at, context('container'));

    expect(fieldLevel['label']?.type).toEqual({ kind: 'never' });
    expect(fieldLevel['label']?.required).toBe(false);
  });
});

describe('props', () => {
  it('flattens props inheritance', () => {
    const props = describeProps(members.get('input')!, at, context('input'));

    expect(Object.keys(props?.keys ?? {}).sort()).toEqual(['appearance', 'density', 'hint', 'onBlur', 'placeholder']);
    expect(props?.keys['placeholder'], 'inherited from InputProps').toBeDefined();
  });

  it('resolves a string literal union to an enum', () => {
    const props = describeProps(members.get('input')!, at, context('input'));

    expect(props?.keys['appearance'].type).toEqual({ kind: 'enum', values: ['fill', 'outline'] });
  });

  it('resolves a numeric literal union to an enum', () => {
    const props = describeProps(members.get('input')!, at, context('input'));

    expect(props?.keys['density'].type).toEqual({ kind: 'enum', values: [-1, 0, 1] });
  });

  it('records the object policy so a future strict migration is visible', () => {
    expect(describeProps(members.get('input')!, at, context('input'))?.policy).toBe('strip');
  });

  it('degrades a function prop to opaque rather than rejecting it', () => {
    const ctx = context('input');
    const props = describeProps(members.get('input')!, at, ctx);

    expect(props?.keys['onBlur'].type.kind).toBe('opaque');
    expect(ctx.unresolved.some((u) => u.path === 'input.props.onBlur')).toBe(true);
  });
});

describe('narrowing', () => {
  it('narrows DynamicText to string and records the dropped arms', () => {
    const props = describeProps(members.get('input')!, at, context('input'));
    const hint = props?.keys['hint'];

    expect(hint?.type).toEqual({ kind: 'string' });
    expect(hint?.narrowedFrom).toBe('DynamicText');
    expect(hint?.droppedArms).toEqual(expect.arrayContaining([expect.stringContaining('Observable'), expect.stringContaining('Signal')]));
  });

  it('does not confuse narrowing with failing to resolve', () => {
    // A narrowed property is understood. It must not appear in `unresolved`,
    // or a deliberate domain decision would read as a degradation.
    const ctx = context('input');
    describeProps(members.get('input')!, at, ctx);

    expect(ctx.unresolved.map((u) => u.path)).not.toContain('input.props.hint');
  });

  it('flags a narrowable type that has no table entry', () => {
    // Exhaustiveness in the direction that matters: a new mixed type appearing
    // in a built-in adapter's props must fail rather than degrade quietly.
    expect(unmappedNarrowingCandidates(['AcmeText'])).toEqual(['AcmeText']);
    expect(unmappedNarrowingCandidates(['DynamicText'])).toEqual([]);
  });

  it('treats only mixed types as narrowable', () => {
    // A bare callback has no serializable arm to keep, so demanding a table
    // entry would be asking for an answer that does not exist, and the gate
    // would fire on correct code.
    expect(isNarrowingCandidate(['string', 'Observable<string>'])).toBe(true);
    expect(isNarrowingCandidate(['(a: string) => void'])).toBe(false);
    expect(isNarrowingCandidate(['Observable<string>'])).toBe(false);
    expect(isNarrowingCandidate(['string', 'number'])).toBe(false);
  });

  it('keeps the narrowing table small and deliberate', () => {
    expect(Object.keys(NARROWING_TABLE)).toEqual(['DynamicText']);
  });
});

describe('field unions', () => {
  it('describes an array item as a field or a list of fields', () => {
    // `ArrayItemDefinition` is one field for a primitive item, or a list of
    // fields for an object item. Recording the second half as opaque would drop
    // a form the config genuinely accepts.
    const structural = describeStructural(members.get('array')!, at, context('array'));

    expect(structural['fields'].type).toEqual({
      kind: 'array',
      of: { kind: 'union', of: [{ kind: 'field' }, { kind: 'array', of: { kind: 'field' } }] },
    });
  });

  it('names no adapter type in a field union', () => {
    // Spelling the union out named the adapter's own prop types, which made an
    // otherwise identical core differ between adapters.
    const ctx = context('array');
    describeStructural(members.get('array')!, at, ctx);

    expect(JSON.stringify(ctx.unresolved)).not.toContain('AcmeInputProps');
  });
});

describe('structural properties', () => {
  it('keeps wrappers required on container, which is what makes it a container', () => {
    // If this ever reads optional, `container` has silently become a synonym
    // for `group` and the schema derived from it would accept both.
    const structural = describeStructural(members.get('container')!, at, context('container'));

    expect(structural['wrappers'], 'wrappers must be described').toBeDefined();
    expect(structural['wrappers'].required, 'wrappers must stay required').toBe(true);
  });

  it('describes fields as required on container', () => {
    const structural = describeStructural(members.get('container')!, at, context('container'));

    expect(structural['fields'].required).toBe(true);
  });

  it('reports no structural properties for a leaf field', () => {
    expect(describeStructural(members.get('input')!, at, context('input'))).toEqual({});
  });
});
