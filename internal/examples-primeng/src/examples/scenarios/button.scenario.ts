import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const buttonScenario: ExampleScenario = {
  id: 'button',
  title: 'Button',
  description: 'Submit button with form validation',
  config: {
    fields: [
      {
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email',
        required: true,
        email: true,
        validationMessages: {
          required: 'This field is required',
          email: 'Please enter a valid email address',
        },
        props: {
          type: 'email',
          placeholder: 'Enter your email',
        },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Submit Form',
        props: {
          severity: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig,
};
