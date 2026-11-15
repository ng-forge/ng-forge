/**
 * An input's `value` is `string | number`, as the core type says, in every adapter.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig } from './validate-config.tool';

const ADAPTERS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

describe('input value', () => {
  it.each(ADAPTERS)('%s accepts a number value', (adapter) => {
    const result = validateFormConfig(adapter, {
      fields: [{ key: 'qty', type: 'input', label: 'Qty', value: 3, props: { type: 'number' } }],
    });
    expect(result.errors ?? []).toEqual([]);
  });

  it.each(ADAPTERS)('%s still rejects a boolean value', (adapter) => {
    expect(validateFormConfig(adapter, { fields: [{ key: 'qty', type: 'input', label: 'Qty', value: true }] }).valid).toBe(false);
  });

  it.each(ADAPTERS)('%s ties the value type to props.type, as the core type does', (adapter) => {
    const numberWithoutType = validateFormConfig(adapter, { fields: [{ key: 'qty', type: 'input', label: 'Qty', value: 3 }] });
    const stringWithNumberType = validateFormConfig(adapter, {
      fields: [{ key: 'qty', type: 'input', label: 'Qty', value: '3', props: { type: 'number' } }],
    });
    expect(numberWithoutType.valid).toBe(false);
    expect(numberWithoutType.errorSummary).toContain("props: { type: 'number' }");
    expect(stringWithNumberType.valid).toBe(false);
  });
});
