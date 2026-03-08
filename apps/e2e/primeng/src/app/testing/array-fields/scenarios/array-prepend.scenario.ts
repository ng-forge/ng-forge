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
            label: 'Value',
            value: 'First',
          },
        ],
        [
          {
            key: 'value',
            type: 'input',
            label: 'Value',
            value: 'Second',
          },
        ],
      ],
    },
    {
      key: 'prependButton',
      type: 'prependArrayItem',
      label: 'Prepend Item',
      arrayKey: 'items',
      template: [{ key: 'value', type: 'input', label: 'Value' }],
      props: {
        severity: 'primary',
      },
    },
    {
      key: 'appendButton',
      type: 'addArrayItem',
      label: 'Append Item',
      arrayKey: 'items',
      template: [{ key: 'value', type: 'input', label: 'Value' }],
    },
  ],
} as const satisfies FormConfig;

export const arrayPrependScenario: TestScenario = {
  testId: 'array-prepend',
  title: 'Prepend Array Items',
  description: 'Add new items at the beginning of the array using prependArrayItem button',
  config,
};
