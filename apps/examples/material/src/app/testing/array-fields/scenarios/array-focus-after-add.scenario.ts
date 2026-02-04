import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'tasks',
      type: 'array',
      fields: [
        [
          {
            key: 'title',
            type: 'input',
            label: 'Task Title',
            value: 'Existing Task',
          },
          {
            key: 'priority',
            type: 'select',
            label: 'Priority',
            options: [
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ],
            value: 'medium',
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
      template: [
        {
          key: 'title',
          type: 'input',
          label: 'Task Title',
        },
        {
          key: 'priority',
          type: 'select',
          label: 'Priority',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const arrayFocusAfterAddScenario: TestScenario = {
  testId: 'array-focus-after-add',
  title: 'Focus After Add',
  description: 'Verify focus management when adding new array items',
  config,
};
