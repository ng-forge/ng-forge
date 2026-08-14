import { CustomValidator, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/** Fails when the group's `dateTo` precedes its `dateFrom`. */
const dateOrder: CustomValidator = (ctx) => {
  const { dateFrom, dateTo } = (ctx.value() ?? {}) as { dateFrom?: string; dateTo?: string };
  return dateFrom && dateTo && dateTo < dateFrom ? { kind: 'dateOrder' } : null;
};

/**
 * Tests a validator declared on a `group` container (issue #568).
 *
 * The rule spans two children, so it lives on the group rather than on one of
 * them: `ctx.value()` resolves to the group's own object. The message has no
 * native form element to attach to, so it renders through the auto-attached
 * `container-errors` wrapper below the group's fields.
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
