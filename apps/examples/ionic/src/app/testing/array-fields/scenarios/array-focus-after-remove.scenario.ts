import { FormConfig, RemoveAtIndexEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'tasks',
      type: 'array',
      fields: [
        {
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
              type: 'button',
              label: 'Remove',
              col: 4,
              event: RemoveAtIndexEvent,
              eventArgs: ['tasks', '$index'],
              props: { color: 'danger' },
            },
          ],
        },
      ],
    },
    {
      key: 'addTask',
      type: 'addArrayItem',
      arrayKey: 'tasks',
      label: 'Add Task',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

export const arrayFocusAfterRemoveScenario: TestScenario = {
  testId: 'array-focus-after-remove',
  title: 'Focus After Remove',
  description: 'Verify focus does not get lost when removing array items',
  config,
  initialValue: {
    tasks: [{ title: 'Task 1' }, { title: 'Task 2' }, { title: 'Task 3' }],
  },
};
