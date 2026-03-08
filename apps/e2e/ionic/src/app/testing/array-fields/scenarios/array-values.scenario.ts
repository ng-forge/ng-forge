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
            key: 'taskName',
            type: 'input',
            label: 'Task',
            value: '',
          },
        ],
      ],
    },
    {
      key: 'addTaskButton',
      type: 'addArrayItem',
      arrayKey: 'tasks',
      label: 'Add Task',
      template: [
        {
          key: 'taskName',
          type: 'input',
          label: 'Task',
        },
      ],
      className: 'array-add-button',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;

export const arrayValuesScenario: TestScenario = {
  testId: 'array-values',
  title: 'Maintain Values',
  description: 'Verify that existing values are maintained when adding new items',
  config,
};
