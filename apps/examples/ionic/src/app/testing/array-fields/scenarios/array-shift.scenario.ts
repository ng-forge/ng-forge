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
        [
          {
            key: 'value',
            type: 'input',
            label: 'Value',
            value: 'Third',
          },
        ],
      ],
    },
    {
      key: 'shiftButton',
      type: 'shiftArrayItem',
      label: 'Remove First',
      arrayKey: 'items',
      props: { color: 'danger' },
    },
    {
      key: 'addButton',
      type: 'addArrayItem',
      arrayKey: 'items',
      label: 'Add Item',
      props: { color: 'primary' },
      template: [{ key: 'value', type: 'input', label: 'Value' }],
    },
  ],
} as const satisfies FormConfig;

export const arrayShiftScenario: TestScenario = {
  testId: 'array-shift',
  title: 'Shift Array Items',
  description: 'Remove the first item from the array using shiftArrayItem button',
  config,
};
