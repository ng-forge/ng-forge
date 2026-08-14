import { CustomValidator, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/** Fails when the group's `dateTo` precedes its `dateFrom`. */
const dateOrder: CustomValidator = (ctx) => {
  const { dateFrom, dateTo } = (ctx.value() ?? {}) as { dateFrom?: string; dateTo?: string };
  return dateFrom && dateTo && dateTo < dateFrom ? { kind: 'dateOrder' } : null;
};

/**
 * Validator on a `group` container (#568): the rule spans two children, so it lives on
 * the group. The message renders through the auto-attached `container-errors` wrapper.
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
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as unknown as FormConfig;

export const containerGroupValidatorScenario: TestScenario = {
  testId: 'container-group-validator-test',
  title: 'Container Validator (Group)',
  description: 'Group-level validator comparing two children, rendered via the container-errors wrapper',
  config,
};
