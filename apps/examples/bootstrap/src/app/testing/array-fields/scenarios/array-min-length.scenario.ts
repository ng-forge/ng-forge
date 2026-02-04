import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'items',
      type: 'array',
      // minLength: 2, // TODO: uncomment when minLength is implemented
      fields: [[{ key: 'item', type: 'input', label: 'Item', value: '' }]],
    },
    {
      key: 'addItemButton',
      type: 'addArrayItem',
      arrayKey: 'items',
      label: 'Add Item',
      className: 'array-add-button',
      template: [
        {
          key: 'item',
          type: 'input',
          label: 'Item',
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const arrayMinLengthScenario: TestScenario = {
  testId: 'array-min-length',
  title: 'Minimum Length',
  description: 'Test minimum length constraint on array fields',
  config,
};
