import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const removeButtonTemplate = {
  key: 'taskRow',
  type: 'row',
  fields: [
    {
      key: 'title',
      type: 'input',
      label: 'Task Title',
      col: 8,
    },
    {
      key: 'removeThis',
      type: 'removeArrayItem',
      label: 'Remove',
      col: 4,
      props: { color: 'warn' },
    },
  ],
} as const;

const config = {
  fields: [
    {
      key: 'tasks',
      type: 'array',
      fields: [
        [
          {
            key: 'taskRow',
            type: 'row',
            fields: [
              {
                key: 'title',
                type: 'input',
                label: 'Task Title',
                col: 8,
                value: 'Task 1',
              },
              {
                key: 'removeThis',
                type: 'removeArrayItem',
                label: 'Remove',
                col: 4,
                props: { color: 'warn' },
              },
            ],
          },
        ],
        [
          {
            key: 'taskRow',
            type: 'row',
            fields: [
              {
                key: 'title',
                type: 'input',
                label: 'Task Title',
                col: 8,
                value: 'Task 2',
              },
              {
                key: 'removeThis',
                type: 'removeArrayItem',
                label: 'Remove',
                col: 4,
                props: { color: 'warn' },
              },
            ],
          },
        ],
        [
          {
            key: 'taskRow',
            type: 'row',
            fields: [
              {
                key: 'title',
                type: 'input',
                label: 'Task Title',
                col: 8,
                value: 'Task 3',
              },
              {
                key: 'removeThis',
                type: 'removeArrayItem',
                label: 'Remove',
                col: 4,
                props: { color: 'warn' },
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'addTask',
      type: 'addArrayItem',
      arrayKey: 'tasks',
      label: 'Add Task',
      props: { color: 'primary' },
      template: [removeButtonTemplate],
    },
  ],
} as const satisfies FormConfig;

export const arrayFocusAfterRemoveScenario: TestScenario = {
  testId: 'array-focus-after-remove',
  title: 'Focus After Remove',
  description: 'Verify focus does not get lost when removing array items',
  config,
};
