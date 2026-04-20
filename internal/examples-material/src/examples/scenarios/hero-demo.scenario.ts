import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const heroDemoScenario: ExampleScenario = {
  id: 'hero-demo',
  title: 'Contact Us',
  description: 'A simple contact form demonstrating ng-forge dynamic forms.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'title',
        type: 'text',
        label: 'Get in Touch',
        props: {
          elementType: 'h2',
        },
      },
      {
        key: 'name',
        type: 'input',
        label: 'Your Name',
        required: true,
        placeholder: 'John Doe',
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        email: true,
        validationMessages: {
          email: 'Please enter a valid email address',
        },
        placeholder: 'you@example.com',
        props: {
          type: 'email',
        },
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        required: true,
        minLength: 10,
        validationMessages: {
          minLength: 'Message must be at least {{requiredLength}} characters',
        },
        placeholder: 'How can we help?',
        props: {
          rows: 3,
        },
      },
      {
        key: 'submit',
        type: 'submit',
        label: 'Send Message',
        props: {
          color: 'primary',
        },
      },
    ],
  } as const satisfies FormConfig,
};
