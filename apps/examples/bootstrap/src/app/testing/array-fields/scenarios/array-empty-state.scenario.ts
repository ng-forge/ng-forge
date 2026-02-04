import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'items',
      type: 'array',
      fields: [],
    },
    {
      key: 'addItem',
      type: 'addArrayItem',
      arrayKey: 'items',
      label: 'Add First Item',
      props: { variant: 'primary' },
      template: [
        {
          key: 'name',
          type: 'input',
          label: 'Name',
        },
        {
          key: 'description',
          type: 'textarea',
          label: 'Description',
        },
      ],
    },
    {
      key: 'removeItem',
      type: 'removeArrayItem',
      arrayKey: 'items',
      label: 'Remove Item',
      props: { variant: 'danger' },
    },
  ],
} as const satisfies FormConfig;

export const arrayEmptyStateScenario: TestScenario = {
  testId: 'array-empty-state',
  title: 'Empty Array State',
  description: 'Test behavior when array starts empty or becomes empty',
  config,
};
