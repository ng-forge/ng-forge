import { FormConfig, PrependArrayItemEvent, AppendArrayItemEvent } from '@ng-forge/dynamic-forms';
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
      key: 'prependButton',
      type: 'button',
      label: 'Prepend Item',
      event: PrependArrayItemEvent,
      eventArgs: ['items'],
      props: {
        variant: 'primary',
      },
    },
    {
      key: 'appendButton',
      type: 'button',
      label: 'Append Item',
      event: AppendArrayItemEvent,
      eventArgs: ['items'],
    },
  ],
} as const satisfies FormConfig;

export const arrayPrependScenario: TestScenario = {
  testId: 'array-prepend',
  title: 'Prepend Array Items',
  description: 'Add new items at the beginning of the array using PrependArrayItemEvent',
  config,
  initialValue: {
    items: [{ value: 'First' }, { value: 'Second' }],
  },
};
