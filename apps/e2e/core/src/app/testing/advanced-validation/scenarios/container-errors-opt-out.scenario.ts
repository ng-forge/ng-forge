import { CustomValidator, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/** Fails when the group's `dateTo` precedes its `dateFrom`. */
const dateOrder: CustomValidator = (ctx) => {
  const { dateFrom, dateTo } = (ctx.value() ?? {}) as { dateFrom?: string; dateTo?: string };
  return dateFrom && dateTo && dateTo < dateFrom ? { kind: 'dateOrder' } : null;
};

/**
 * `wrappers: null` opts a container out of the auto-attached `field-errors` wrapper
 * (#568). The validator still runs and still gates submit — only the message is
 * suppressed, which is the documented escape hatch.
 */
const config = {
  customFnConfig: { validators: { dateOrder } },
  fields: [
    {
      key: 'period',
      type: 'group',
      wrappers: null,
      fields: [
        { key: 'dateFrom', type: 'input', label: 'From', value: '', col: 6 },
        { key: 'dateTo', type: 'input', label: 'To', value: '', col: 6 },
      ],
      validators: [{ type: 'custom', functionName: 'dateOrder' }],
      validationMessages: { dateOrder: 'The end must not be before the start.' },
    },
    { key: 'submit', type: 'submit', label: 'Submit', col: 12 },
  ],
} as unknown as FormConfig;

export const containerErrorsOptOutScenario: TestScenario = {
  testId: 'container-errors-opt-out-test',
  title: 'Container Errors Opt-Out',
  description: 'wrappers: null suppresses the container message while the validator still gates submit',
  config,
};
