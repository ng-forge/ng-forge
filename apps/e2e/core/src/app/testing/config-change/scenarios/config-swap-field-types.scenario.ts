import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Two configs with the SAME field keys but DIFFERENT field `type`s.
 *
 * Exercises the outlet's rebuildKey path: when `@for track field.key`
 * reuses the outlet but the resolved component class changes, the
 * wrapper-chain controller must rebuild the innermost slot without
 * carrying stale inputs into the new component. Prior regression
 * (NG0950) occurred when the rawInputs ref-diff cache still held
 * the previous value for `key`, so the required `key` input on the
 * new component was never set.
 */

const configA = {
  fields: [
    {
      key: 'shared',
      type: 'input',
      label: 'Shared field (input)',
      value: '',
      placeholder: 'as input',
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

const configB = {
  fields: [
    {
      key: 'shared',
      type: 'select',
      label: 'Shared field (select)',
      value: '',
      options: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const configSwapFieldTypesConfigVariants = {
  initial: configA,
  alternate: configB,
};

export const configSwapFieldTypesScenario: TestScenario = {
  testId: 'config-swap-field-types',
  title: 'Config Swap — Field Type Change on Shared Key',
  description: 'Swap a field from one type to another while keeping the same key; validates the outlet rebuildKey + rawInputs reset paths.',
  config: configA,
};
