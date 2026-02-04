import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'phones',
      type: 'array',
      fields: [
        [
          {
            key: 'phone',
            type: 'input',
            label: 'Phone',
            value: '555-0001',
          },
        ],
        [
          {
            key: 'phone',
            type: 'input',
            label: 'Phone',
            value: '555-0002',
          },
        ],
      ],
    },
    {
      key: 'removePhoneButton',
      type: 'removeArrayItem',
      label: 'Remove Last',
      className: 'array-remove-button',
      arrayKey: 'phones',
    },
  ],
} as const satisfies FormConfig;

export const arrayRemoveScenario: TestScenario = {
  testId: 'array-remove',
  title: 'Remove Array Items',
  description: 'Remove phone numbers from the array field',
  config,
};
