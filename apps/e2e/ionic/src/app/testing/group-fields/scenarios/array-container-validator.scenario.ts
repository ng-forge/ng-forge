import { CustomValidator, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/** Fails when any row's `to` precedes its `from`. `ctx.value()` is the item list. */
const periodOrder: CustomValidator = (ctx) => {
  const rows = (ctx.value() ?? []) as { from?: string; to?: string }[];
  return rows.some((r) => r?.from && r?.to && r.to < r.from) ? { kind: 'periodOrder' } : null;
};

/**
 * Validator on an `array` container (#568), left untargeted so the message stays on the
 * array and is rendered by this adapter's `field-errors` wrapper. The row-targeted
 * variant lives in the core suite, where it exercises core routing rather than markup.
 */
const config = {
  customFnConfig: { validators: { periodOrder } },
  fields: [
    {
      key: 'periods',
      type: 'array',
      template: [
        { key: 'from', type: 'input', label: 'From', col: 6 },
        { key: 'to', type: 'input', label: 'To', col: 6 },
      ],
      value: [{ from: '', to: '' }],
      minLength: 1,
      validators: [{ type: 'custom', functionName: 'periodOrder' }],
      validationMessages: { periodOrder: 'The end must not be before the start.' },
    },
    { key: 'submit', type: 'submit', label: 'Submit', col: 12 },
  ],
} as unknown as FormConfig;

export const arrayContainerValidatorScenario: TestScenario = {
  testId: 'array-container-validator-test',
  title: 'Array Container Validator',
  description: 'Array-level validator rendered through the field-errors wrapper',
  config,
};
