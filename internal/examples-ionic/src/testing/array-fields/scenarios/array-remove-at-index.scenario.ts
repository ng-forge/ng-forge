import { FormConfig, RemoveAtIndexEvent } from '@ng-forge/dynamic-forms';
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
      key: 'removeAtOneButton',
      type: 'button',
      label: 'Remove at Index 1',
      event: RemoveAtIndexEvent,
      eventArgs: ['items', 1],
      props: { color: 'danger' },
    },
    {
      key: 'removeAtZeroButton',
      type: 'button',
      label: 'Remove at Index 0',
      event: RemoveAtIndexEvent,
      eventArgs: ['items', 0],
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

export const arrayRemoveAtIndexScenario: TestScenario = {
  testId: 'array-remove-at-index',
  title: 'Remove at Specific Index',
  description: 'Remove items at specific positions using RemoveAtIndexEvent',
  config,
};
