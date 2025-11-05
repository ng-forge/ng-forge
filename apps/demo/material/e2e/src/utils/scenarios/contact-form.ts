import { FormConfig } from '@ng-forge/dynamic-form';
import '@ng-forge/dynamic-form-material';

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
      defaultValue: 'Jane Smith',
      col: 6,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      required: true,
      defaultValue: 'jane@example.com',
      props: { type: 'email' },
      validators: [{ type: 'required' }, { type: 'email' }],
      col: 6,
    },
    {
      key: 'phone',
      type: 'input',
      label: 'Phone Number',
      defaultValue: '+1 (555) 123-4567',
      props: { type: 'tel' },
      validators: [{ type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$' }],
      col: 6,
    },
    {
      key: 'subject',
      type: 'select',
      label: 'Subject',
      required: true,
      defaultValue: 'general',
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
      defaultValue: 'Hello, I would like to know more about your dynamic form system.',
      props: { rows: 4 },
      validators: [{ type: 'required' }, { type: 'minLength', value: 10 }],
    },
    {
      key: 'priority',
      type: 'select',
      label: 'Priority',
      defaultValue: 'medium',
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
      defaultValue: false,
      col: 6,
    },
    {
      key: 'submit',
      type: 'button',
      label: 'Send Message',
      props: {
        type: 'submit',
        color: 'primary',
      },
    },
  ],
};
