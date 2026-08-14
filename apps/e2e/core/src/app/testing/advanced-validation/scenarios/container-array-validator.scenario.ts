import { CustomValidator, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/** Fails when any row's `to` precedes its `from`. `ctx.value()` is the item list. */
const periodOrder: CustomValidator = (ctx) => {
  const rows = (ctx.value() ?? []) as { from?: string; to?: string }[];
  return rows.some((r) => r?.from && r?.to && r.to < r.from) ? { kind: 'periodOrder' } : null;
};

/**
 * Tests a validator declared on an `array` container (issue #568), using the
 * reporter's own shape: a list of `{ from, to }` periods where every row must
 * end after it starts.
 *
 * This rule has no other home — the array itself is the only scope that can see
 * both fields of a row, because a validator on the `to` template child cannot
 * reach its sibling `from`. `ctx.value()` here is the whole item list.
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
} as unknown as FormConfig;

export const containerArrayValidatorScenario: TestScenario = {
  testId: 'container-array-validator-test',
  title: 'Container Validator (Array)',
  description: 'Array-level validator enforcing per-row ordering across the item list',
  config,
};
