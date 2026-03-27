import { FormConfig } from '@ng-forge/dynamic-forms';

export const contactDynamicFieldsConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'Value is too short',
  },
  fields: [
    {
      key: 'name',
      type: 'input',
      value: '',
      label: 'Full Name',
      required: true,
    },
    {
      key: 'contactMethod',
      type: 'select',
      value: '',
      label: 'Preferred Contact Method',
      required: true,
      options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'mail', label: 'Postal Mail' },
      ],
    },
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email Address',
      email: true,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'notEquals',
            value: 'email',
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'equals',
            value: 'email',
          },
        },
      ],
    },
    {
      key: 'phone',
      type: 'input',
      value: '',
      label: 'Phone Number',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'notEquals',
            value: 'phone',
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'equals',
            value: 'phone',
          },
        },
      ],
      props: { type: 'tel' },
    },
    {
      key: 'address',
      type: 'textarea',
      value: '',
      label: 'Mailing Address',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'notEquals',
            value: 'mail',
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'contactMethod',
            operator: 'equals',
            value: 'mail',
          },
        },
      ],
      props: { rows: 3 },
    },
    {
      key: 'message',
      type: 'textarea',
      value: '',
      label: 'Message',
      required: true,
      minLength: 10,
      props: { rows: 4 },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Send Message',
    },
  ],
} as const satisfies FormConfig;
