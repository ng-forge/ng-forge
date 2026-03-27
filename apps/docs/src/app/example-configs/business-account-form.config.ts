import { FormConfig } from '@ng-forge/dynamic-forms';

export const businessAccountFormConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'accountType',
      type: 'radio',
      value: 'personal',
      label: 'Account Type',
      required: true,
      options: [
        { value: 'personal', label: 'Personal Account' },
        { value: 'business', label: 'Business Account' },
      ],
    },
    {
      key: 'name',
      type: 'input',
      value: '',
      label: 'Full Name',
      required: true,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
      ],
    },
    {
      key: 'companyName',
      type: 'input',
      value: '',
      label: 'Company Name',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'notEquals',
            value: 'business',
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
      ],
    },
    {
      key: 'taxId',
      type: 'input',
      value: '',
      label: 'Tax ID',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'notEquals',
            value: 'business',
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'equals',
            value: 'business',
          },
        },
      ],
    },
    {
      key: 'numberOfEmployees',
      type: 'input',
      value: undefined,
      label: 'Number of Employees',
      props: { type: 'number' },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'notEquals',
            value: 'business',
          },
        },
      ],
    },
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email Address',
      required: true,
      email: true,
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Create Account',
    },
  ],
} as const satisfies FormConfig;
