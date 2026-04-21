import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const contactScenario: ExampleScenario = {
  id: 'contact',
  title: 'Contact Form',
  description: 'Simple contact form demonstrating basic form fields, validation, and user input.',
  config: {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        value: '',
        required: true,
        placeholder: 'Your first name',
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        value: '',
        required: true,
        placeholder: 'Your last name',
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        value: '',
        required: true,
        email: true,
        placeholder: 'email@example.com',
        props: {
          type: 'email',
        },
      },
      {
        key: 'phone',
        type: 'input',
        label: 'Phone',
        value: '',
        placeholder: '+1 (555) 000-0000',
        props: {
          type: 'tel',
        },
      },
      {
        key: 'subject',
        type: 'select',
        label: 'Subject',
        value: '',
        required: true,
        options: [
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Technical Support' },
          { value: 'sales', label: 'Sales Question' },
          { value: 'feedback', label: 'Feedback' },
        ],
        placeholder: 'Select a subject',
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        value: '',
        required: true,
        minLength: 10,
        maxLength: 500,
        validationMessages: {
          required: 'Please enter your message',
          minLength: 'Message must be at least 10 characters',
          maxLength: 'Message cannot exceed 500 characters',
        },
        placeholder: 'Tell us how we can help...',
        props: {
          rows: 5,
        },
      },
      {
        key: 'subscribe',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        value: false,
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Send Message',
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig,
};
