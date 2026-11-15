/**
 * Slider and datepicker values follow the core types, which every adapter shares:
 * a slider holds a number, a number array or `{ lower, upper }`, and a datepicker a
 * Date or ISO string, or an array of them.
 */

import { describe, it, expect } from 'vitest';
import { validateFormConfig } from './validate-config.tool';

const ADAPTERS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

const valid: [string, unknown][] = [
  ['a range slider', { key: 's', type: 'slider', label: 'S', value: [10, 20] }],
  ['a dual-knob slider', { key: 's', type: 'slider', label: 'S', value: { lower: 1, upper: 5 } }],
  ['a multi-date datepicker', { key: 'd', type: 'datepicker', label: 'D', value: ['2026-01-01', '2026-01-05'] }],
];

const invalid: [string, unknown][] = [
  ['a slider with string items', { key: 's', type: 'slider', label: 'S', value: ['10'] }],
  ['a slider object missing upper', { key: 's', type: 'slider', label: 'S', value: { lower: 1 } }],
  ['a datepicker with number items', { key: 'd', type: 'datepicker', label: 'D', value: [1] }],
];

describe.each(ADAPTERS)('%s multi-value fields', (adapter) => {
  it.each(valid)('accepts %s', (_, field) => {
    expect(validateFormConfig(adapter, { fields: [field] }).errors ?? []).toEqual([]);
  });

  it.each(invalid)('rejects %s', (_, field) => {
    expect(validateFormConfig(adapter, { fields: [field] }).valid).toBe(false);
  });
});
