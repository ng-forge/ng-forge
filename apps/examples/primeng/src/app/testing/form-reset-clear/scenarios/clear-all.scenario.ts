import { FormClearEvent, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      props: {
        type: 'email',
      },
    },
    {
      key: 'clear-button',
      type: 'button',
      label: 'Clear All',
      event: FormClearEvent,
      props: {
        type: 'button',
      },
    },
  ],
} as const satisfies FormConfig;

export const clearAllScenario: TestScenario = {
  testId: 'clear-all',
  title: 'Clear All Fields',
  description: 'Tests clearing all form fields',
  config,
};
