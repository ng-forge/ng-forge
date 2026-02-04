import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'items',
      type: 'array',
      fields: [
        [
          {
            key: 'value',
            type: 'input',
            label: 'Item',
            value: 'Initial',
          },
        ],
      ],
    },
    {
      key: 'addItem',
      type: 'addArrayItem',
      arrayKey: 'items',
      label: 'Add Item',
      props: { severity: 'primary' },
      template: [
        {
          key: 'value',
          type: 'input',
          label: 'Item',
        },
      ],
    },
    {
      key: 'removeItem',
      type: 'removeArrayItem',
      arrayKey: 'items',
      label: 'Remove Item',
      props: { severity: 'danger' },
    },
  ],
} as const satisfies FormConfig;

export const arrayRapidOperationsScenario: TestScenario = {
  testId: 'array-rapid-operations',
  title: 'Rapid Operations Stress Test',
  description: 'Test rapid-fire add/remove operations to verify no race conditions occur',
  config,
};
