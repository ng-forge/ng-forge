import { FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'userInfo',
      type: 'group',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          value: 'John',
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          value: 'Doe',
        },
      ],
    },
    {
      key: 'reset-button',
      type: 'button',
      label: 'Reset',
      event: FormResetEvent,
      props: {
        type: 'button',
      },
    },
  ],
} as const satisfies FormConfig;

export const resetNestedScenario: TestScenario = {
  testId: 'reset-nested',
  title: 'Reset Nested Group Fields',
  description: 'Tests resetting nested group fields',
  config,
};
