import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const businessAccountFormScenario: ExampleScenario = {
  id: 'business-account-form',
  title: 'Business Account Form',
  description: 'Account registration form that shows different fields based on personal or business account type.',
  config: {
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
        props: { color: 'primary' },
      },
      {
        key: 'name',
        type: 'input',
        value: '',
        label: 'Full Name',
        required: true,
        props: { appearance: 'outline' },
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
        props: { appearance: 'outline' },
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
        props: { appearance: 'outline' },
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
        props: { type: 'number', appearance: 'outline' },
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
        props: { appearance: 'outline' },
      },
      {
        type: 'submit',
        key: 'submit',
        label: 'Create Account',
        props: { color: 'primary' },
      },
    ],
  } as const satisfies FormConfig,
};
