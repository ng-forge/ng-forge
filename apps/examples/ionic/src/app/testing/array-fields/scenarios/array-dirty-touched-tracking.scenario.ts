import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'entries',
      type: 'array',
      fields: [
        [
          {
            key: 'name',
            type: 'input',
            label: 'Entry Name',
            required: true,
            value: 'Initial Entry',
          },
          {
            key: 'value',
            type: 'input',
            label: 'Entry Value',
            value: 'Initial Value',
          },
        ],
      ],
    },
    {
      key: 'addEntry',
      type: 'addArrayItem',
      arrayKey: 'entries',
      label: 'Add Entry',
      template: [
        {
          key: 'name',
          type: 'input',
          label: 'Entry Name',
          required: true,
        },
        {
          key: 'value',
          type: 'input',
          label: 'Entry Value',
        },
      ],
      props: { color: 'primary' },
    },
    {
      key: 'removeEntry',
      type: 'removeArrayItem',
      arrayKey: 'entries',
      label: 'Remove Last',
      props: { color: 'danger' },
    },
  ],
} as const satisfies FormConfig;

export const arrayDirtyTouchedTrackingScenario: TestScenario = {
  testId: 'array-dirty-touched-tracking',
  title: 'Dirty/Touched State Tracking',
  description: 'Verify form dirty and touched states propagate correctly through array operations',
  config,
};
