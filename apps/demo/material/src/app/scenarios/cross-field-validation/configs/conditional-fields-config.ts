import { FormConfig } from '@ng-forge/dynamic-form';

export const conditionalFieldsConfig = {
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Conditional Fields Demo',
      props: {
        elementType: 'h2',
      },
      col: 12,
    },
    {
      key: 'description',
      type: 'text',
      label: 'Fields appear and disappear based on your selections.',
      col: 12,
    },
    {
      key: 'hasAccount',
      type: 'radio',
      label: 'Do you have an existing account?',
      options: [
        { value: 'yes', label: 'Yes, I have an account' },
        { value: 'no', label: 'No, I need to create one' },
      ],
      required: true,
      col: 12,
    },
    {
      key: 'loginEmail',
      type: 'input',
      label: 'Login Email',
      props: {
        type: 'email',
        placeholder: 'Enter your existing email',
      },
      required: true,
      email: true,
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'hasAccount',
            operator: 'notEquals',
            value: 'yes',
          },
        },
      ],
    },
    {
      key: 'loginPassword',
      type: 'input',
      label: 'Password',
      props: {
        type: 'password',
        placeholder: 'Enter your password',
      },
      required: true,
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'hasAccount',
            operator: 'notEquals',
            value: 'yes',
          },
        },
      ],
    },
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      props: {
        placeholder: 'Enter your first name',
      },
      required: true,
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'hasAccount',
            operator: 'notEquals',
            value: 'no',
          },
        },
      ],
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      props: {
        placeholder: 'Enter your last name',
      },
      required: true,
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'hasAccount',
            operator: 'notEquals',
            value: 'no',
          },
        },
      ],
    },
    {
      key: 'newEmail',
      type: 'input',
      label: 'Email Address',
      props: {
        type: 'email',
        placeholder: 'Enter your email address',
      },
      required: true,
      email: true,
      col: 12,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'hasAccount',
            operator: 'notEquals',
            value: 'no',
          },
        },
      ],
    },
    {
      key: 'shippingAddressDifferent',
      type: 'checkbox',
      label: 'My shipping address is different from billing address',
      props: {
        color: 'primary',
      },
      col: 12,
    },
    {
      key: 'shippingAddress',
      type: 'group',
      label: 'Shipping Address',
      fields: [
        {
          key: 'shippingStreet',
          type: 'input',
          label: 'Street Address',
          props: {
            placeholder: 'Enter shipping street address',
          },
          required: true,
          col: 12,
        },
        {
          key: 'shippingCity',
          type: 'input',
          label: 'City',
          props: {
            placeholder: 'Enter shipping city',
          },
          required: true,
          col: 6,
        },
        {
          key: 'shippingZip',
          type: 'input',
          label: 'ZIP Code',
          props: {
            placeholder: 'Enter ZIP code',
          },
          required: true,
          col: 6,
        },
      ],
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Continue',
      props: {
        color: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;
