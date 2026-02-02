import { FormConfig, InsertArrayItemEvent } from '@ng-forge/dynamic-forms';
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
      key: 'insertAtOneButton',
      type: 'button',
      label: 'Insert at Index 1',
      event: InsertArrayItemEvent,
      eventArgs: ['items', 1],
      props: {
        variant: 'primary',
      },
    },
    {
      key: 'insertAtZeroButton',
      type: 'button',
      label: 'Insert at Index 0',
      event: InsertArrayItemEvent,
      eventArgs: ['items', 0],
    },
  ],
} as const satisfies FormConfig;

export const arrayInsertAtIndexScenario: TestScenario = {
  testId: 'array-insert-at-index',
  title: 'Insert at Specific Index',
  description: 'Insert new items at specific positions using InsertArrayItemEvent',
  config,
  initialValue: {
    items: [{ value: 'First' }, { value: 'Third' }],
  },
};
