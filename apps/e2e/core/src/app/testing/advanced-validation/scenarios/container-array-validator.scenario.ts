import { rowError, type CustomValidator, type FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Fails when any row's `to` precedes its `from`. `ctx.value()` is the item list.
 *
 * Each error carries a `fieldTree` so it renders on the offending row's own input rather
 * than as one message for the whole list. A re-homed error must carry its own `message` —
 * the container's `validationMessages` are not in scope on the child.
 */
const periodOrder: CustomValidator = (ctx) => {
  const rows = (ctx.value() ?? []) as { from?: string; to?: string }[];

  return rows.flatMap((row, index) =>
    row?.from && row?.to && row.to < row.from
      ? [rowError(ctx, index, 'to', { kind: 'periodOrder', message: 'The end must not be before the start.' })]
      : [],
  );
};

/**
 * Validator on an `array` container (#568): a list of `{ from, to }` periods where
 * every row must end after it starts. The array is the only scope that sees both
 * fields of a row.
 */
const config = {
  customFnConfig: { validators: { periodOrder } },
  fields: [
    {
      key: 'soundPeriods',
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
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const containerArrayValidatorScenario: TestScenario = {
  testId: 'container-array-validator-test',
  title: 'Container Validator (Array)',
  description: 'Array-level validator enforcing per-row ordering across the item list',
  config,
};
