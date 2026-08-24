import type { FormConfig } from '@ng-forge/dynamic-forms';

export const TOGGLE_GATED_COUNT = 100;

/** One trigger input plus `TOGGLE_GATED_COUNT` fields hidden when it reads `off`. */
export function toggleVisibilityConfig(): FormConfig {
  const gated = Array.from({ length: TOGGLE_GATED_COUNT }, (_, i) => ({
    key: `gated${i + 1}`,
    type: 'input',
    label: `Gated ${i + 1}`,
    value: '',
    validators: [{ type: 'minLength', value: 2 }],
    logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'trigger', operator: 'equals', value: 'off' } }],
  }));

  return {
    fields: [{ key: 'trigger', type: 'input', label: 'Trigger', value: 'on' }, ...gated],
  } as unknown as FormConfig;
}
