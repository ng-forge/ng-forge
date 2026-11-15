/**
 * The validator runs the library's dev-mode expression check, so a condition or derivation
 * that can never work fails validation instead of quietly doing nothing at runtime.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig } from './validate-config.tool';
import { getFixSuggestion } from '../../../reporting/fix-suggestions';

function expressionErrors(config: unknown) {
  return (validateFormConfig('material', config).errors ?? []).filter((error) => error.ruleId === 'core/expression-syntax');
}

describe('expression check', () => {
  it.each([
    [
      'a javascript condition using a global',
      { type: 'hidden', condition: { type: 'javascript', expression: 'Math.max(formValue.a, 1) > 2' } },
      'Math',
    ],
    [
      'a javascript condition that does not parse',
      { type: 'hidden', condition: { type: 'javascript', expression: 'formValue.a ==' } },
      '==',
    ],
    ['a derivation calling a function directly', { type: 'derivation', expression: 'String(formValue.a)' }, 'String'],
    [
      '?? mixed with || unparenthesised',
      { type: 'hidden', condition: { type: 'javascript', expression: 'formValue.a ?? formValue.b || true' } },
      '??',
    ],
    ['an empty and group', { type: 'required', condition: { type: 'and', conditions: [] } }, 'never fires'],
  ])('reports %s with its path', (_, logic, mention) => {
    const errors = expressionErrors({ fields: [{ key: 'name', type: 'input', label: 'Name', logic: [logic] }] });
    expect(errors).toHaveLength(1);
    expect(errors[0].path).toMatch(/^fields\[0\]\.logic\[0\]/);
    expect(errors[0].message).toContain(mention);
    expect(validateFormConfig('material', { fields: [{ key: 'name', type: 'input', label: 'Name', logic: [logic] }] }).valid).toBe(false);
  });

  it('reports the derivation shorthand', () => {
    const errors = expressionErrors({ fields: [{ key: 'sum', type: 'input', label: 'Sum', derivation: 'parseInt(formValue.a)' }] });
    expect(errors).toEqual([expect.objectContaining({ path: 'fields[0].derivation', message: expect.stringContaining('parseInt') })]);
    // Not the placement hint keyed on `derivation`.
    expect(getFixSuggestion(errors[0])).toContain('custom function');
  });

  it('finds expressions in nested containers and array templates, once each', () => {
    const errors = expressionErrors({
      fields: [
        {
          key: 'person',
          type: 'group',
          fields: [{ key: 'city', type: 'input', label: 'City', derivation: 'JSON.stringify(formValue)' }],
        },
        {
          key: 'items',
          type: 'array',
          template: [{ key: 'qty', type: 'input', label: 'Qty', derivation: 'Number(formValue.qty)' }],
          value: [],
        },
      ],
    });
    expect(errors.map((error) => error.path)).toEqual(['fields[0].fields[0].derivation', 'fields[1].template[0].derivation']);
  });

  it('accepts expressions the parser supports', () => {
    const result = validateFormConfig('material', {
      fields: [
        { key: 'a', type: 'input', label: 'A', props: { type: 'number' } },
        { key: 'b', type: 'input', label: 'B', derivation: '(formValue.a ?? 0).toFixed(2)' },
        {
          key: 'c',
          type: 'input',
          label: 'C',
          logic: [
            {
              type: 'hidden',
              condition: { type: 'javascript', expression: 'formValue.items?.some(i => i.done) && !externalData.flags.beta' },
            },
            { type: 'derivation', expression: 'formValue.b ? formValue.b.trim().toUpperCase() : ""' },
          ],
        },
      ],
    });
    expect(result.errors ?? []).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
