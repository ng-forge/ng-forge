import { FormConfig } from '@ng-forge/dynamic-forms';

export const contactConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      value: '',
      required: true,
      props: { placeholder: 'Your first name' },
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      value: '',
      required: true,
      props: { placeholder: 'Your last name' },
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: '',
      required: true,
      email: true,
      props: {
        type: 'email',
        placeholder: 'email@example.com',
      },
    },
    {
      key: 'phone',
      type: 'input',
      label: 'Phone',
      value: '',
      props: {
        type: 'tel',
        placeholder: '+1 (555) 000-0000',
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
      props: { placeholder: 'Select a subject' },
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
      props: {
        placeholder: 'Tell us how we can help...',
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
    },
  ],
} as const satisfies FormConfig;
