import { FormConfig } from '@ng-forge/dynamic-form';

export const personalInfoConfig = {
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Personal Information',
      props: {
        elementType: 'h2',
      },
      col: 12,
    },
    {
      key: 'description',
      type: 'text',
      label: 'Please provide your personal details to get started.',
      col: 12,
    },
    {
      key: 'personalDetails',
      type: 'group',
      label: 'Basic Information',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          props: {
            placeholder: 'Enter your first name',
            appearance: 'outline',
          },
          required: true,
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          props: {
            placeholder: 'Enter your last name',
            appearance: 'outline',
          },
          required: true,
          col: 6,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email Address',
          props: {
            type: 'email',
            placeholder: 'Enter your email address',
            appearance: 'outline',
          },
          required: true,
          email: true,
          col: 12,
        },
        {
          key: 'phone',
          type: 'input',
          label: 'Phone Number',
          props: {
            type: 'tel',
            placeholder: '+1 (555) 123-4567',
            appearance: 'outline',
          },
          required: true,
          col: 6,
        },
        {
          key: 'dateOfBirth',
          type: 'datepicker',
          label: 'Date of Birth',
          props: {
            appearance: 'outline',
          },
          required: true,
          col: 6,
        },
      ],
      col: 12,
    },
    {
      key: 'address',
      type: 'group',
      label: 'Address Information',
      fields: [
        {
          key: 'street',
          type: 'input',
          label: 'Street Address',
          props: {
            placeholder: '123 Main Street',
            appearance: 'outline',
          },
          required: true,
          col: 12,
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          props: {
            placeholder: 'Enter your city',
            appearance: 'outline',
          },
          required: true,
          col: 4,
        },
        {
          key: 'state',
          type: 'select',
          label: 'State',
          options: [
            { value: 'ca', label: 'California' },
            { value: 'ny', label: 'New York' },
            { value: 'tx', label: 'Texas' },
            { value: 'fl', label: 'Florida' },
            { value: 'il', label: 'Illinois' },
          ],
          props: {
            placeholder: 'Select state',
            appearance: 'outline',
          },
          required: true,
          col: 4,
        },
        {
          key: 'zipCode',
          type: 'input',
          label: 'ZIP Code',
          props: {
            placeholder: '12345',
            appearance: 'outline',
          },
          required: true,
          pattern: /^[0-9]{5}$/,
          col: 4,
        },
      ],
      col: 12,
    },
    {
      key: 'submit',
      type: 'button',
      label: 'Continue to Account Setup',
      props: {
        type: 'submit',
        color: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;
