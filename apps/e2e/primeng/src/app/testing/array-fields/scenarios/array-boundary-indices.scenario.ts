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
      ],
    },
    {
      key: 'insertAtEnd',
      type: 'insertArrayItem',
      label: 'Insert at Index 100',
      arrayKey: 'items',
      index: 100,
      template: [{ key: 'value', type: 'input', label: 'Value' }],
    },
    {
      key: 'removeAtEnd',
      type: 'button',
      label: 'Remove at Index 100',
      event: RemoveAtIndexEvent,
      eventArgs: ['items', 100],
      props: {
        severity: 'danger',
      },
    },
    {
      key: 'addItem',
      type: 'addArrayItem',
      arrayKey: 'items',
      label: 'Add Item',
      props: { severity: 'primary' },
      template: [
        {
          key: 'value',
          type: 'input',
          label: 'Value',
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const arrayBoundaryIndicesScenario: TestScenario = {
  testId: 'array-boundary-indices',
  title: 'Boundary Index Handling',
  description: 'Test behavior when using out-of-bounds indices for insert/remove operations',
  config,
};
