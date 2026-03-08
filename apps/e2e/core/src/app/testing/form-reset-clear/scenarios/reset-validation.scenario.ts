import { FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: 'valid@example.com',
      required: true,
      email: true,
      props: {
        type: 'email',
      },
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

export const resetValidationScenario: TestScenario = {
  testId: 'reset-validation',
  title: 'Reset Validation State',
  description: 'Tests resetting validation state of form fields',
  config,
};
