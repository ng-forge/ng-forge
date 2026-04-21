import { FormConfig } from '@ng-forge/dynamic-forms';

export const groupConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'User Profile',
      props: { elementType: 'h2' },
    },
    {
      key: 'name',
      type: 'input',
      label: 'Full Name',
      value: '',
      required: true,
      placeholder: 'Enter your full name',
    },
    {
      key: 'address',
      type: 'group',
      fields: [
        {
          key: 'street',
          type: 'input',
          label: 'Street Address',
          value: '',
          required: true,
          placeholder: '123 Main St',
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          value: '',
          required: true,
          placeholder: 'Springfield',
        },
        {
          key: 'state',
          type: 'input',
          label: 'State',
          value: '',
          required: true,
          maxLength: 2,
          placeholder: 'IL',
          validationMessages: {
            maxLength: 'State abbreviation must be 2 characters',
          },
          props: {
            hint: 'Enter 2-letter state abbreviation',
          },
        },
        {
          key: 'zip',
          type: 'input',
          label: 'ZIP Code',
          value: '',
          required: true,
          pattern: '^\\d{5}$',
          placeholder: '62701',
          validationMessages: {
            pattern: 'Please enter a valid 5-digit ZIP code',
          },
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Save Profile',
    },
  ],
} as const satisfies FormConfig;
