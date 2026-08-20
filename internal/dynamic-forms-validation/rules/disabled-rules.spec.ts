/**
 * Disabling a rule, end to end through the validator.
 *
 * The catalogue named the rules; this is what makes naming them worth anything.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig } from '../validate/src';
import { resolveDisabledRules } from './catalogue';

/** A select with its options in the wrong place: the most common mistake. */
const optionsInProps = {
  fields: [{ key: 'country', type: 'select', label: 'Country', props: { options: [{ label: 'UK', value: 'uk' }] } }],
};

/** A hidden field with no value. */
const hiddenNoValue = { fields: [{ key: 'ref', type: 'hidden' }] };

/** A hidden field carrying a label, which it cannot render. One finding, one rule. */
const hiddenWithLabel = { fields: [{ key: 'ref', type: 'hidden', value: 'web', label: 'nope' }] };

describe('a finding carries the rule it violates', () => {
  it('names the rule for a semantic check', () => {
    const result = validateFormConfig('material', optionsInProps);

    expect(result.errors?.some((e) => e.ruleId === 'core/options-at-field-level')).toBe(true);
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

describe('disabling a rule', () => {
  it('downgrades the finding to a warning rather than hiding it', () => {
    const disabled = resolveDisabledRules(['core/options-at-field-level']);
    const result = validateFormConfig('material', optionsInProps, { disabledRules: disabled });

    const finding = result.errors?.find((e) => e.ruleId === 'core/options-at-field-level');
    expect(finding, 'the finding should still be reported').toBeDefined();
    expect(finding?.severity).toBe('warning');
  });

  it('makes the config valid when nothing else is wrong', () => {
    // That is what disabling means. Reporting it and still failing would be a
    // switch that does nothing.
    const disabled = resolveDisabledRules(['core/hidden-minimal']);

    expect(validateFormConfig('material', hiddenWithLabel, { disabledRules: disabled }).valid).toBe(true);
  });

  it('cannot rescue a config that is also structurally wrong', () => {
    // Options inside props trips two findings: the placement rule, and the
    // schema noticing the select has no options at all. Only the first has an
    // id, so disabling it reports the placement as a warning and the config
    // still fails — which is right, because the field genuinely lacks options.
    const disabled = resolveDisabledRules(['core/options-at-field-level']);
    const result = validateFormConfig('material', optionsInProps, { disabledRules: disabled });

    expect(result.valid).toBe(false);
    expect(result.errors?.find((e) => e.ruleId === 'core/options-at-field-level')?.severity).toBe('warning');
    expect(result.errors?.some((e) => e.ruleId === undefined && e.severity === 'error')).toBe(true);
  });

  it('leaves other rules failing', () => {
    const disabled = resolveDisabledRules(['core/options-at-field-level']);
    const result = validateFormConfig('material', hiddenNoValue, { disabledRules: disabled });

    expect(result.valid).toBe(false);
    expect(result.errors?.some((e) => e.ruleId === 'core/hidden-requires-value' && e.severity === 'error')).toBe(true);
  });

  it('cannot rescue a config that also breaks a type-derived constraint', () => {
    // The escape hatch stops exactly where the compiler starts.
    const disabled = resolveDisabledRules(['core/options-at-field-level']);
    const config = {
      fields: [
        { key: 'country', type: 'select', label: 'Country', props: { options: [{ label: 'UK', value: 'uk' }] } },
        { key: 'r', type: 'row', fields: [], label: 'nope' },
      ],
    };

    expect(validateFormConfig('material', config, { disabledRules: disabled }).valid).toBe(false);
  });

  it('changes nothing when the list is empty', () => {
    const result = validateFormConfig('material', optionsInProps, { disabledRules: new Set() });

    expect(result.valid).toBe(false);
  });
});
