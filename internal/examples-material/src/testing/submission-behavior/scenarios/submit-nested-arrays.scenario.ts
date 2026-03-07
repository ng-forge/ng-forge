import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'projectName',
      type: 'input',
      label: 'Project Name',
      value: 'My Project',
      props: { placeholder: 'Enter project name' },
    },
    {
      key: 'tasks',
      type: 'array',
      fields: [
        [
          {
            key: 'taskName',
            type: 'input',
            label: 'Task Name',
            value: 'Task 1',
            col: 6,
            props: { placeholder: 'Enter task name' },
          },
          {
            key: 'priority',
            type: 'select',
            label: 'Priority',
            col: 6,
            value: 'medium',
            options: [
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ],
          },
        ],
        [
          {
            key: 'taskName',
            type: 'input',
            label: 'Task Name',
            value: 'Task 2',
            col: 6,
            props: { placeholder: 'Enter task name' },
          },
          {
            key: 'priority',
            type: 'select',
            label: 'Priority',
            col: 6,
            value: 'high',
            options: [
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ],
          },
        ],
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: { type: 'submit', color: 'primary' },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const submitNestedArraysScenario: TestScenario = {
  testId: 'submit-nested-arrays',
  title: 'Submit Nested Arrays',
  description: 'Verify submitted JSON shape with arrays of objects',
  config,
};
