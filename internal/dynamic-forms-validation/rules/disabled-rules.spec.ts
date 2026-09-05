/**
 * Disabling a rule, end to end through the validator.
 *
 * The catalogue named the rules; this is what makes naming them worth anything.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig } from '../validate/src';
import { RULE_IDS, resolveDisabledRules } from './catalogue';

/** A hidden field carrying a label, which it cannot render. One finding, one rule. */
const hiddenWithLabel = { fields: [{ key: 'ref', type: 'hidden', value: 'web', label: 'nope' }] };

/**
 * One config per rule, violating that rule and nothing else.
 *
 * Every id has to have one: a rule with no fixture is a rule nobody has shown
 * can be switched off, which is the failure this table exists to prevent.
 */
const violations: Readonly<Record<string, unknown>> = {
  'core/hidden-minimal': hiddenWithLabel,
  'core/nesting': {
    fields: [{ key: 'row', type: 'row', fields: [{ key: 'page', type: 'page', fields: [{ key: 'a', type: 'input', label: 'A' }] }] }],
  },
  'core/slider-range-properties': { fields: [{ key: 'size', type: 'slider', label: 'Size', props: { min: 0, max: 10 } }] },
  'core/validation-messages-location': {
    fields: [{ key: 'name', type: 'input', label: 'Name', validators: [{ type: 'minLength', value: 3, message: 'too short' }] }],
  },
};

describe('a finding carries the rule it violates', () => {
  it('names the rule for a semantic check', () => {
    const result = validateFormConfig('material', hiddenWithLabel);

    expect(result.errors?.some((e) => e.ruleId === 'core/hidden-minimal')).toBe(true);
  });

  it('leaves type-derived findings unnamed', () => {
    // A container's label is forbidden by the types, so it is not a rule and
    // must never acquire an id: there would be nothing coherent to disable.
    const result = validateFormConfig('material', {
      fields: [{ key: 'r', type: 'row', fields: [{ key: 'a', type: 'input', label: 'A' }], label: 'nope' }],
    });

    const labelError = result.errors?.find((e) => e.path.endsWith('.label'));
    expect(labelError).toBeDefined();
    expect(labelError?.ruleId).toBeUndefined();
  });
});

describe('every catalogued rule can actually be switched off', () => {
  it('has a violating config for each id', () => {
    expect(Object.keys(violations).sort()).toEqual([...RULE_IDS]);
  });

  it.each([...RULE_IDS])('%s', (id) => {
    const config = violations[id];

    expect(validateFormConfig('material', config).valid, 'the rule should fail the config while it is on').toBe(false);

    const result = validateFormConfig('material', config, { disabledRules: resolveDisabledRules([id]) });

    // Both halves matter. Still invalid means the switch does nothing, which is
    // what an id promises it does not; a silent pass means the finding was
    // hidden rather than downgraded, which teaches the reader nothing.
    expect(result.valid, 'disabling the rule should make the config valid').toBe(true);
    expect(result.errors?.find((e) => e.ruleId === id)?.severity, 'the finding should still be reported, as a warning').toBe('warning');
  });
});

describe('disabling a rule', () => {
  it('leaves other rules failing', () => {
    const disabled = resolveDisabledRules(['core/hidden-minimal']);
    const result = validateFormConfig('material', violations['core/nesting'], { disabledRules: disabled });

    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.ruleId === 'core/nesting' && e.severity === 'error')).toBe(true);
  });

  it('cannot rescue a config that also breaks a type-derived constraint', () => {
    // The escape hatch stops exactly where the compiler starts.
    const disabled = resolveDisabledRules(['core/hidden-minimal']);
    const config = {
      fields: [
        { key: 'ref', type: 'hidden', value: 'web', label: 'nope' },
        { key: 'r', type: 'row', fields: [], label: 'nope' },
      ],
    };

    expect(validateFormConfig('material', config, { disabledRules: disabled }).valid).toBe(false);
  });

  it('changes nothing when the list is empty', () => {
    const result = validateFormConfig('material', hiddenWithLabel, { disabledRules: new Set() });

    expect(result.valid).toBe(false);
  });
});
