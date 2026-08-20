/**
 * `template` on the array-add buttons.
 *
 * The type declares it required and its doc comment says REQUIRED, but no button
 * schema carried it, so the validator passed a config that does not compile.
 * That is the worst shape of gap: the skill tells agents to trust a clean run,
 * and a clean run meant nothing here.
 *
 * Found by reviewing the generated skills against the source, where the skill's
 * own canonical example turned out not to typecheck.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig, type UiIntegration } from '../../../../validate/src';

const ADAPTERS: UiIntegration[] = ['material', 'bootstrap', 'primeng', 'ionic'];
const ADDING_BUTTONS = ['add-array-item', 'prepend-array-item', 'insert-array-item'] as const;

const child = { key: 'name', type: 'input', label: 'Name' };

/** `insert-array-item` also needs an index; the others do not. */
function button(type: string, extra: Record<string, unknown> = {}) {
  return { key: 'act', type, ...(type === 'insert-array-item' ? { index: 0 } : {}), ...extra };
}

const check = (config: unknown, ui: UiIntegration = 'material') => validateFormConfig(ui, { fields: [config] });

describe('a button that adds an item requires a template', () => {
  it.each(ADAPTERS)('rejects every adding button without one (%s)', (ui) => {
    for (const type of ADDING_BUTTONS) {
      expect(check(button(type), ui).valid, `${type} was accepted with no template`).toBe(false);
    }
  });

  it.each(ADAPTERS)('accepts a single field as a primitive item template (%s)', (ui) => {
    for (const type of ADDING_BUTTONS) {
      const result = check(button(type, { template: child }), ui);
      expect(result.valid, (result.errors ?? []).map((e) => e.message).join('\n')).toBe(true);
    }
  });

  it.each(ADAPTERS)('accepts a list of fields as an object item template (%s)', (ui) => {
    for (const type of ADDING_BUTTONS) {
      const result = check(button(type, { template: [child, { key: 'email', type: 'input', label: 'Email' }] }), ui);
      expect(result.valid, (result.errors ?? []).map((e) => e.message).join('\n')).toBe(true);
    }
  });

  it('rejects a template that is plainly not a field', () => {
    expect(check(button('add-array-item', { template: 'name' })).valid).toBe(false);
    expect(check(button('add-array-item', { template: { label: 'no type' } })).valid).toBe(false);
  });
});

describe('buttons that remove an item take no template', () => {
  // Only the adding buttons need to know what an item looks like. Requiring it
  // on the others would reject configs that are correct today.
  //
  // `pop` and `shift` take a required `arrayKey`, unlike the adding buttons
  // where it is optional and comes from the surrounding array. The types say the
  // same, so the asymmetry is deliberate rather than drift.
  it.each([
    ['remove-array-item', {}],
    ['pop-array-item', { arrayKey: 'items' }],
    ['shift-array-item', { arrayKey: 'items' }],
  ])('%s validates without one', (type, extra) => {
    const result = check({ key: 'act', type, ...extra });
    expect(result.valid, (result.errors ?? []).map((e) => e.message).join('\n')).toBe(true);
  });
});
