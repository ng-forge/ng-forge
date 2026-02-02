import { FormConfig, InsertArrayItemEvent, RemoveAtIndexEvent } from '@ng-forge/dynamic-forms';
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
      key: 'insertAtEnd',
      type: 'button',
      label: 'Insert at Index 100',
      event: InsertArrayItemEvent,
      eventArgs: ['items', 100],
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
    },
  ],
} as const satisfies FormConfig;

export const arrayBoundaryIndicesScenario: TestScenario = {
  testId: 'array-boundary-indices',
  title: 'Boundary Index Handling',
  description: 'Test behavior when using out-of-bounds indices for insert/remove operations',
  config,
  initialValue: {
    items: [{ value: 'First' }, { value: 'Second' }],
  },
};
