import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'name',
      type: 'input',
      label: 'Full Name',
      required: true,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      required: true,
      email: true,
      props: {
        type: 'email',
      },
    },
    {
      key: 'message',
      type: 'textarea',
      label: 'Message',
      required: true,
      props: {
        rows: 5,
        placeholder: 'Enter your message here...',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Send Message',
    },
  ],
} as const satisfies FormConfig;

export const contactFormWorkflowScenario: TestScenario = {
  testId: 'contact-form',
  title: 'Complex Form Workflow',
  description: 'Tests complex form with multiple field types',
  config,
};
