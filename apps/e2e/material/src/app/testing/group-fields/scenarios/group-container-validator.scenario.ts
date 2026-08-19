import { CustomValidator, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/** Fails when the group's `dateTo` precedes its `dateFrom`. */
const dateOrder: CustomValidator = (ctx) => {
  const { dateFrom, dateTo } = (ctx.value() ?? {}) as { dateFrom?: string; dateTo?: string };
  return dateFrom && dateTo && dateTo < dateFrom ? { kind: 'dateOrder' } : null;
};

/**
 * Validator on a `group` container (#568). Verifies Material's `field-errors` wrapper
 * replaces the neutral core default and renders the message natively.
 */
const config = {
  customFnConfig: { validators: { dateOrder } },
  fields: [
    {
      key: 'period',
      type: 'group',
      fields: [
        { key: 'dateFrom', type: 'input', label: 'From', value: '', col: 6 },
        { key: 'dateTo', type: 'input', label: 'To', value: '', col: 6 },
      ],
      validators: [{ type: 'custom', functionName: 'dateOrder' }],
      validationMessages: { dateOrder: 'The end must not be before the start.' },
    },
    { key: 'submit', type: 'submit', label: 'Submit', col: 12 },
  ],
} as const satisfies FormConfig;

export const groupContainerValidatorScenario: TestScenario = {
  testId: 'group-container-validator-test',
  title: 'Group Container Validator',
  description: 'Group-level validator rendered through the field-errors wrapper',
  config,
};
