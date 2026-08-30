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
import { parseAdapterDescriptor, parseCoreDescriptor } from './serialize';
import { validateFormConfig, type UiIntegration } from '../validate/src';
import type { CoreDescriptor } from './descriptor.types';

const GENERATED = join(__dirname, 'generated');
const ADAPTERS: UiIntegration[] = ['material', 'bootstrap', 'primeng', 'ionic'];

const readFile = (name: string) => readFileSync(join(GENERATED, `${name}.json`), 'utf-8');

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
  // and the doc comment says REQUIRED. Spelled out here because the schema that
  // enforces it is newer than the rule.
  ['an array action with its index', { fields: [{ key: 'ins', type: 'insert-array-item', index: 0, template: child }] }],
  ['the camelCase spelling of an array action', { fields: [{ key: 'add', type: 'addArrayItem', template: child }] }],
  [
    'container-level validators on a group',
    { fields: [{ key: 'g', type: 'group', fields: [child], validators: [{ type: 'custom', functionName: 'f' }] }] },
  ],
];

/** Configs the hand-written schemas reject, tracked as coverage rather than asserted. */
const REJECTED: Array<[string, unknown]> = [
  // Both schemas reject this now. It stays as the record of a divergence that
  // has closed: the type has always declared `template` required, and the
  // hand-written schema was the half that did not enforce it.
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
  core = parseCoreDescriptor(readFile('core'));
  for (const adapter of ADAPTERS) {
    derived.set(adapter, compileFormConfigSchema(core, parseAdapterDescriptor(readFile(adapter))));
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
      const rejected = (handWritten.errors ?? []).map((e) => `${e.path}: ${e.message}`).join('\n');

      // The premise of the table, asserted rather than assumed. Returning early
      // when the hand-written schema stopped accepting a row let the whole suite
      // go green while comparing nothing: a row that has moved belongs in
      // REJECTED, and moving it should be a decision someone made.
      expect(handWritten.valid, `ACCEPTED lists a config the hand-written schema now rejects\n${rejected}`).toBe(true);

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
  }, 30_000);

  it('parses fast enough to be worth measuring before cutover', () => {
    // The number is the point as much as the assertion. The hand-written schemas
    // are flat discriminated unions; the derived one is a lazy union of every
    // field type, so the cutover should be a decision with a measurement
    // attached rather than a surprise.
    const config = { fields: [{ key: 'a', type: 'input', label: 'A' }] };
    const schema = derived.get('material')!;

    const started = Date.now();
    for (let i = 0; i < 10; i++) schema.safeParse(config);
    const perParse = (Date.now() - started) / 10;

    console.info(`[differential] derived schema: ${perParse.toFixed(0)}ms per parse`);

    // A ceiling, not a budget. `>= 0` held for any number a clock can produce,
    // so deleting the memoization that took this from 52ms to under 1ms would
    // not have gone red. Loose enough not to flake on a slow runner, tight
    // enough that rebuilding the union per parse cannot pass.
    expect(perParse, 'the field union is being rebuilt per parse').toBeLessThan(10);
  }, 30_000);
});
