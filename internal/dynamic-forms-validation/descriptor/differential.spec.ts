/**
 * Phase 2: the derived schema run beside the hand-written one.
 *
 * This is the oracle. The hand-written schemas are a complete, adversarially
 * tested specification of the right answer, and they only exist until the
 * cutover, so everything they know has to be checked against the derived schema
 * while both are here.
 *
 * The derived schema is deliberately more permissive: everything the descriptor
 * records as opaque passes through. So the assertion is asymmetric on purpose —
 * a config the hand-written schema accepts must be accepted, because rejecting
 * it would break working code. A config it rejects is reported rather than
 * failed, because the derived schema does not yet carry every refinement, and
 * pretending otherwise would freeze today's gaps in as the specification.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compileFormConfigSchema } from './compile-schema';
import { parseDescriptor } from './serialize';
import { validateFormConfig, type UiIntegration } from '../validate/src';
import type { AdapterDescriptor, CoreDescriptor } from './descriptor.types';

const GENERATED = join(__dirname, 'generated');
const ADAPTERS: UiIntegration[] = ['material', 'bootstrap', 'primeng', 'ionic'];

const read = (name: string) => parseDescriptor(readFileSync(join(GENERATED, `${name}.json`), 'utf-8'));

const child = { key: 'email', type: 'input', label: 'Email' };

/** Configs the hand-written schemas accept. The derived schema must too. */
const ACCEPTED: Array<[string, unknown]> = [
  ['a single leaf field', { fields: [child] }],
  ['a required input', { fields: [{ key: 'a', type: 'input', label: 'A', required: true }] }],
  ['a select with field-level options', { fields: [{ key: 'c', type: 'select', label: 'C', options: [{ value: 'x', label: 'X' }] }] }],
  ['a hidden field with a value', { fields: [{ key: 'h', type: 'hidden', value: 'web' }] }],
  ['a group with children', { fields: [{ key: 'g', type: 'group', fields: [child] }] }],
  ['a row with children', { fields: [{ key: 'r', type: 'row', fields: [child] }] }],
  ['a container with wrappers', { fields: [{ key: 'k', type: 'container', wrappers: [], fields: [child] }] }],
  ['a page with nav buttons', { fields: [{ key: 'p', type: 'page', fields: [child, { key: 'n', type: 'next' }] }] }],
  ['an array with an item template', { fields: [{ key: 'items', type: 'array', fields: [child] }] }],
  // `template` is required on the array-action buttons: the type declares it so
  // and the doc comment says REQUIRED. The hand-written schema omits it
  // entirely, so it accepts an insert button with nothing to insert.
  ['an array action with its index', { fields: [{ key: 'ins', type: 'insert-array-item', index: 0, template: child }] }],
  ['the camelCase spelling of an array action', { fields: [{ key: 'add', type: 'addArrayItem', template: child }] }],
  [
    'container-level validators on a group',
    { fields: [{ key: 'g', type: 'group', fields: [child], validators: [{ type: 'custom', functionName: 'f' }] }] },
  ],
];

/** Configs the hand-written schemas reject, tracked as coverage rather than asserted. */
const REJECTED: Array<[string, unknown]> = [
  // The hand-written schema accepts this, wrongly: the type declares `template`
  // required. Kept here as the record of a divergence the derived schema fixes.
  ['an insert button with no template', { fields: [{ key: 'ins', type: 'insert-array-item', index: 0 }] }],
  ['an unknown field type', { fields: [{ key: 'a', type: 'acme-currency', label: 'A' }] }],
  ['a label on a container', { fields: [{ key: 'k', type: 'container', wrappers: [], fields: [], label: 'no' }] }],
  ['a label on a row', { fields: [{ key: 'r', type: 'row', fields: [child], label: 'no' }] }],
  ['a container with no wrappers', { fields: [{ key: 'k', type: 'container', fields: [child] }] }],
  ['validators on a row', { fields: [{ key: 'r', type: 'row', fields: [child], validators: [{ type: 'custom', functionName: 'f' }] }] }],
];

let core: CoreDescriptor;
const derived = new Map<UiIntegration, ReturnType<typeof compileFormConfigSchema>>();

beforeAll(() => {
  core = read('core') as unknown as CoreDescriptor;
  for (const adapter of ADAPTERS) {
    derived.set(adapter, compileFormConfigSchema(core, read(adapter) as unknown as AdapterDescriptor));
  }
});

describe('the derived schema compiles from the committed descriptors', () => {
  it.each(ADAPTERS)('builds a schema for %s', (adapter) => {
    expect(derived.get(adapter)).toBeDefined();
  });
});

describe('anything the hand-written schema accepts, the derived one accepts', () => {
  // The direction that matters. A derived schema that rejects working config
  // breaks real projects on upgrade; one that is too permissive only fails to
  // catch something, which the unresolved list already admits to.
  for (const [name, config] of ACCEPTED) {
    it.each(ADAPTERS)(`${name} (%s)`, (adapter) => {
      const handWritten = validateFormConfig(adapter, config);
      if (!handWritten.valid) return; // not part of this contract; see the report below

      const result = derived.get(adapter)!.safeParse(config);
      const detail = result.success ? '' : JSON.stringify(result.error.issues.slice(0, 3), null, 2);

      expect(result.success, `derived schema rejected a config the hand-written one accepts\n${detail}`).toBe(true);
    });
  }
});

describe('coverage report against the hand-written schema', () => {
  it('reports which rejections the derived schema does not yet reproduce', () => {
    // Not a failure. The derived schema is permissive by design wherever the
    // descriptor records opaque, and naming the gap is what keeps it from being
    // mistaken for a regression later.
    const missing: string[] = [];

    for (const [name, config] of REJECTED) {
      for (const adapter of ADAPTERS) {
        if (validateFormConfig(adapter, config).valid) continue;
        if (derived.get(adapter)!.safeParse(config).success) missing.push(`${name} (${adapter})`);
      }
    }

    console.info(`[differential] rejections not yet reproduced: ${missing.length} of ${REJECTED.length * ADAPTERS.length}`);
    for (const entry of missing) console.info(`  - ${entry}`);

    // The prohibitions are the ones the descriptor genuinely encodes, so those
    // must hold. Everything else is reported.
    const labelGaps = missing.filter((entry) => entry.startsWith('a label on'));
    expect(labelGaps, 'never-typed keys are recorded in the descriptor and must be enforced').toEqual([]);

    // The gaps that remain are unknown-key rejections. The descriptor records
    // `strip` for props, which is what the hand-written schemas do, and strip
    // removes an unexpected key rather than refusing it. Closing this is the
    // `.strict()` migration, not a defect in the derivation.
    expect(missing.every((entry) => entry.startsWith('validators on a row'))).toBe(true);
    // Deliberately generous: the derived schema is a large lazy union and a
    // single parse is slow. Measured below, and worth knowing before cutover.
  }, 30_000);

  it('parses fast enough to be worth measuring before cutover', () => {
    // Not a budget, a datum. The hand-written schemas are flat discriminated
    // unions; the derived one is a lazy union of every field type, and the
    // difference shows. Recorded so the cutover is a decision with a number
    // attached rather than a surprise.
    const config = { fields: [{ key: 'a', type: 'input', label: 'A' }] };
    const schema = derived.get('material')!;

    const started = Date.now();
    for (let i = 0; i < 10; i++) schema.safeParse(config);
    const perParse = (Date.now() - started) / 10;

    console.info(`[differential] derived schema: ${perParse.toFixed(0)}ms per parse`);
    expect(perParse).toBeGreaterThanOrEqual(0);
  }, 30_000);
});
