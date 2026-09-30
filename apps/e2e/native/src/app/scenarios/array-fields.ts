import type { FormConfig } from '@ng-forge/dynamic-forms';
import type { TestSuite } from '../types';

export const arrayFieldsSuite: TestSuite = {
  id: 'array-fields',
  title: 'Array Fields',
  scenarios: [
    {
      testId: 'array-add',
      title: 'Add Array Items',
      description: 'Add new email addresses to the array field',
      config: {
        fields: [
          {
            key: 'emails',
            type: 'array',
            fields: [[{ key: 'email', type: 'input', label: 'Email', props: { type: 'email' }, value: '' }]],
          },
          {
            key: 'addEmailButton',
            type: 'add-array-item',
            arrayKey: 'emails',
            label: 'Add Email',
            template: [{ key: 'email', type: 'input', label: 'Email', props: { type: 'email' } }],
          },
        ],
      } as const satisfies FormConfig,
    },
    {
      testId: 'array-remove',
      title: 'Remove Array Items',
      description: 'Remove phone numbers from the array field',
      config: {
        fields: [
          {
            key: 'phones',
            type: 'array',
            fields: [
              [{ key: 'phone', type: 'input', label: 'Phone', value: '555-0001' }],
              [{ key: 'phone', type: 'input', label: 'Phone', value: '555-0002' }],
            ],
          },
          { key: 'removePhoneButton', type: 'remove-array-item', label: 'Remove Last', arrayKey: 'phones' },
        ],
      } as const satisfies FormConfig,
    },
  ],
};
