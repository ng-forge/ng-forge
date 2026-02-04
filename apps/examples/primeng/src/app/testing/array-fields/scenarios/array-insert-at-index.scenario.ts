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
            value: 'Third',
          },
        ],
      ],
    },
    {
      key: 'insertAtOneButton',
      type: 'insertArrayItem',
      label: 'Insert at Index 1',
      arrayKey: 'items',
      index: 1,
      template: [{ key: 'value', type: 'input', label: 'Value' }],
      props: {
        severity: 'primary',
      },
    },
    {
      key: 'insertAtZeroButton',
      type: 'insertArrayItem',
      label: 'Insert at Index 0',
      arrayKey: 'items',
      index: 0,
      template: [{ key: 'value', type: 'input', label: 'Value' }],
    },
  ],
} as const satisfies FormConfig;

export const arrayInsertAtIndexScenario: TestScenario = {
  testId: 'array-insert-at-index',
  title: 'Insert at Specific Index',
  description: 'Insert new items at specific positions using insertArrayItem button',
  config,
};
