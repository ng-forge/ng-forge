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
      props: { severity: 'danger' },
    },
  ],
} as const;

const createTaskItem = (title: string) =>
  ({
    key: 'taskRow',
    type: 'row',
    fields: [
      {
        key: 'title',
        type: 'input',
        label: 'Task Title',
        col: 8,
        value: title,
      },
      {
        key: 'removeThis',
        type: 'removeArrayItem',
        label: 'Remove',
        col: 4,
        props: { severity: 'danger' },
      },
    ],
  }) as const;

const config = {
  fields: [
    {
      key: 'tasks',
      type: 'array',
      fields: [[createTaskItem('Task 1')], [createTaskItem('Task 2')], [createTaskItem('Task 3')]],
    },
    {
      key: 'addTask',
      type: 'addArrayItem',
      arrayKey: 'tasks',
      label: 'Add Task',
      props: { severity: 'primary' },
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
