import { FormConfig, ShiftArrayItemEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'items',
      type: 'array',
      fields: [
        {
          key: 'value',
          type: 'input',
          label: 'Value',
        },
      ],
    },
    {
      key: 'shiftButton',
      type: 'button',
      label: 'Remove First',
      event: ShiftArrayItemEvent,
      eventArgs: ['items'],
      props: { color: 'danger' },
    },
    {
      key: 'addButton',
      type: 'addArrayItem',
      arrayKey: 'items',
      label: 'Add Item',
      template: [
        {
          key: 'value',
          type: 'input',
          label: 'Value',
        },
      ],
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

export const arrayShiftScenario: TestScenario = {
  testId: 'array-shift',
  title: 'Shift Array Items',
  description: 'Remove the first item from the array using ShiftArrayItemEvent',
  config,
  initialValue: {
    items: [{ value: 'First' }, { value: 'Second' }, { value: 'Third' }],
  },
};
