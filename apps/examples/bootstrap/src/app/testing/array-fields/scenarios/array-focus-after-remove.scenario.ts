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
      props: { variant: 'danger' },
    },
  ],
} as const;

const config = {
  fields: [
    {
      key: 'tasks',
      type: 'array',
      fields: [removeButtonTemplate],
    },
    {
      key: 'addTask',
      type: 'addArrayItem',
      arrayKey: 'tasks',
      label: 'Add Task',
      props: { variant: 'primary' },
      template: [removeButtonTemplate],
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
