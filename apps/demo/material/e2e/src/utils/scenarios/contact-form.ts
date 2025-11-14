import { FormConfig } from '@ng-forge/dynamic-form';

/**
 * Contact Form - Simple validation
 */
export const contactFormConfig = {
  fields: [
    {
      key: 'name',
      type: 'input',
      label: 'Full Name',
      required: true,
      value: 'Jane Smith',
      col: 6,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      required: true,
      value: 'jane@example.com',
      props: { type: 'email' },
      validators: [{ type: 'required' }, { type: 'email' }],
      col: 6,
    },
    {
      key: 'phone',
      type: 'input',
      label: 'Phone Number',
      value: '+1 (555) 123-4567',
      props: { type: 'tel' },
      validators: [{ type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$' }],
      col: 6,
    },
    {
      key: 'subject',
      type: 'select',
      label: 'Subject',
      required: true,
      value: 'general',
      options: [
        { value: 'general', label: 'General Inquiry' },
        { value: 'support', label: 'Technical Support' },
        { value: 'billing', label: 'Billing Question' },
        { value: 'feature', label: 'Feature Request' },
      ],
      col: 6,
    },
    {
      key: 'message',
      type: 'textarea',
      label: 'Message',
      required: true,
      value: 'Hello, I would like to know more about your dynamic form system.',
      props: { rows: 4 },
      validators: [{ type: 'required' }, { type: 'minLength', value: 10 }],
    },
    {
      key: 'priority',
      type: 'select',
      label: 'Priority',
      value: 'medium',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
      ],
      col: 6,
    },
    {
      key: 'copyMe',
      type: 'checkbox',
      label: 'Send me a copy of this message',
      value: false,
      col: 6,
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
} as const satisfies FormConfig;
