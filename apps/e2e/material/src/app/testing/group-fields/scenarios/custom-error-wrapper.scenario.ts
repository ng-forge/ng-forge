import { CustomValidator, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/** Fails when the group's `dateTo` precedes its `dateFrom`. */
const dateOrder: CustomValidator = (ctx) => {
  const { dateFrom, dateTo } = (ctx.value() ?? {}) as { dateFrom?: string; dateTo?: string };
  return dateFrom && dateTo && dateTo < dateFrom ? { kind: 'dateOrder' } : null;
};

/**
 * A container carrying a wrapper registered under its own name with `rendersFieldErrors`.
 * The built-in `field-errors` must not be appended alongside it, or the same message would
 * render twice.
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
      wrappers: [{ type: 'custom-errors' }],
    },
    { key: 'submit', type: 'submit', label: 'Submit', col: 12 },
  ],
} as const satisfies FormConfig;

export const customErrorWrapperScenario: TestScenario = {
  testId: 'custom-error-wrapper-test',
  title: 'Custom Error Wrapper',
  description: 'A container whose own wrapper renders the errors, suppressing the built-in default',
  config,
};
