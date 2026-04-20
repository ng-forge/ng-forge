import { FormConfig } from '@ng-forge/dynamic-forms';

export const rowConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Contact Form',
      props: { elementType: 'h2' },
    },
    {
      key: 'nameRow',
      type: 'row',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          value: '',
          required: true,
          placeholder: 'John',
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          value: '',
          required: true,
          placeholder: 'Doe',
          col: 6,
        },
      ],
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      value: '',
      required: true,
      email: true,
      placeholder: 'john.doe@example.com',
      props: {
        type: 'email',
      },
    },
    {
      key: 'addressRow',
      type: 'row',
      fields: [
        {
          key: 'city',
          type: 'input',
          label: 'City',
          value: '',
          required: true,
          placeholder: 'Springfield',
          col: 6,
        },
        {
          key: 'state',
          type: 'input',
          label: 'State',
          value: '',
          required: true,
          maxLength: 2,
          placeholder: 'IL',
          col: 3,
          validationMessages: { maxLength: 'Use 2-letter abbreviation' },
        },
        {
          key: 'zip',
          type: 'input',
          label: 'ZIP',
          value: '',
          required: true,
          pattern: '^\\d{5}$',
          placeholder: '62701',
          col: 3,
          validationMessages: { pattern: 'Must be 5 digits' },
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;
