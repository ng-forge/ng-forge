/**
 * Container-level validation, as the type system defines it.
 *
 * `ContainerValidation` is extended by exactly `GroupField`, `ArrayField` and
 * `SimplifiedArrayField`, and its own documentation states the rule:
 *
 *   "Layout containers (page, row, container) flatten into their parent and have
 *    no schema path, so they are excluded."
 *
 * The validator disagreed with that in both directions: it rejected `validators`
 * and `required` on group and array, which the runtime supports and the MCP
 * registry documents, while accepting them on `container`, which cannot hold a
 * value at all. An agent following the documented guidance produced a config the
 * validator rejected with a message asserting the guidance was wrong.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig, type UiIntegration } from '../../../../validate/src';

const ADAPTERS: UiIntegration[] = ['material', 'bootstrap', 'primeng', 'ionic'];
const child = { key: 'from', type: 'input', label: 'From' };
const validators = [{ type: 'custom', functionName: 'dateOrder' }];

function check(config: unknown, ui: UiIntegration = 'material') {
  const result = validateFormConfig(ui, config);
  return {
    valid: result.valid,
    data: result.data,
    text: (result.errors ?? []).map((e) => `${e.path}: ${e.message}`).join('\n'),
  };
}

const group = (extra: Record<string, unknown>) => ({ fields: [{ key: 'g', type: 'group', fields: [child], ...extra }] });
const array = (extra: Record<string, unknown>) => ({ fields: [{ key: 'a', type: 'array', fields: [child], ...extra }] });
const simplifiedArray = (extra: Record<string, unknown>) => ({
  fields: [{ key: 'a', type: 'array', template: child, value: [], ...extra }],
});
const row = (extra: Record<string, unknown>) => ({ fields: [{ key: 'r', type: 'row', fields: [child], ...extra }] });
const container = (extra: Record<string, unknown>) => ({
  fields: [{ key: 'c', type: 'container', wrappers: [], fields: [child], ...extra }],
});

describe('containers that own a schema path accept validation', () => {
  it.each(ADAPTERS)('accepts validators on a group (%s)', (ui) => {
    const result = check(group({ validators }), ui);
    expect(result.valid, result.text).toBe(true);
  });

  it.each(ADAPTERS)('accepts validators on an array (%s)', (ui) => {
    const result = check(array({ validators }), ui);
    expect(result.valid, result.text).toBe(true);
  });

  it('accepts required on a group, which cascades to descendants', () => {
    expect(check(group({ required: true })).valid).toBe(true);
  });

  it('accepts required on an array', () => {
    expect(check(array({ required: true })).valid).toBe(true);
  });

  it('accepts validationMessages alongside validators', () => {
    expect(check(group({ validators, validationMessages: { custom: 'Dates are out of order' } })).valid).toBe(true);
  });

  it.each([
    ['group', group],
    ['array', array],
    ['simplified array', simplifiedArray],
  ] as const)('preserves validation properties in parsed %s data', (_name, make) => {
    const result = check(
      make({
        required: true,
        validators,
        validationMessages: { custom: 'Dates are out of order' },
      }),
    );

    expect(result.data?.fields[0]).toMatchObject({
      required: true,
      validators,
      validationMessages: { custom: 'Dates are out of order' },
    });
  });

  it('accepts validateWhenHidden, which gates the container own validators', () => {
    expect(check(group({ validators, validateWhenHidden: true })).valid).toBe(true);
  });

  it('accepts array size constraints, which are not container validation', () => {
    // minLength/maxLength are array size, governed separately from validators.
    expect(check(array({ minLength: 1, maxLength: 5 })).valid).toBe(true);
  });
});

describe('layout containers do not', () => {
  // These flatten into their parent and have no schema path, so a validator on
  // them would have nothing to resolve `ctx.value()` against.
  it.each(ADAPTERS)('rejects validators on a row (%s)', (ui) => {
    expect(check(row({ validators }), ui).valid).toBe(false);
  });

  it.each(ADAPTERS)('rejects validators on a container (%s)', (ui) => {
    expect(check(container({ validators }), ui).valid).toBe(false);
  });

  it('rejects required on a row', () => {
    expect(check(row({ required: true })).valid).toBe(false);
  });

  it('rejects required on a container', () => {
    expect(check(container({ required: true })).valid).toBe(false);
  });

  it.each(['validators', 'required', 'validationMessages', 'minLength', 'maxLength'])('rejects %s on a page', (prop) => {
    const values: Record<string, unknown> = {
      validators,
      required: true,
      validationMessages: { custom: 'Nope' },
      minLength: 1,
      maxLength: 1,
    };
    const config = { fields: [{ key: 'p', type: 'page', fields: [child], [prop]: values[prop] }] };

    expect(check(config).valid).toBe(false);
  });

  it('explains why rather than only refusing', () => {
    const result = check(container({ validators }));
    expect(result.text).toMatch(/no schema path|flatten|layout/i);
  });
});

describe('value-level properties stay rejected on every container', () => {
  it.each([
    ['group', group],
    ['array', array],
    ['row', row],
    ['container', container],
  ] as const)('rejects email on %s', (_name, make) => {
    expect(check(make({ email: true })).valid).toBe(false);
  });

  it('rejects a bare value on a group', () => {
    expect(check(group({ value: 'x' })).valid).toBe(false);
  });

  it('still allows value on a simplified array, which uses it for initial data', () => {
    const config = { fields: [{ key: 'tags', type: 'array', template: child, value: ['a'] }] };
    expect(check(config).valid, check(config).text).toBe(true);
  });
});
