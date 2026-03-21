import { FormConfig } from '@ng-forge/dynamic-forms';

export const ageConditionalFormConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'name',
      type: 'input',
      value: '',
      label: 'Full Name',
      required: true,
      props: { appearance: 'outline' },
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
      key: 'age',
      type: 'input',
      value: undefined,
      label: 'Age',
      required: true,
      min: 0,
      max: 120,
      validationMessages: {
        min: 'Age must be at least 0',
        max: 'Age must be at most 120',
      },
      props: {
        type: 'number',
        hint: 'Enter your age to see relevant options',
        appearance: 'outline',
      },
    },
    {
      key: 'parentalConsent',
      type: 'checkbox',
      value: false,
      label: 'I have parental/guardian consent to register',
      props: { color: 'primary' },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'greaterOrEqual',
            value: 18,
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'less',
            value: 18,
          },
        },
      ],
    },
    {
      key: 'parentEmail',
      type: 'input',
      value: '',
      label: 'Parent/Guardian Email',
      email: true,
      props: {
        hint: 'We will send a verification email to your parent/guardian',
        appearance: 'outline',
      },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'greaterOrEqual',
            value: 18,
          },
        },
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'less',
            value: 18,
          },
        },
      ],
    },
    {
      key: 'seniorDiscount',
      type: 'checkbox',
      value: false,
      label: 'Apply senior discount (65+)',
      props: { color: 'primary' },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'less',
            value: 65,
          },
        },
      ],
    },
    {
      key: 'aarpMember',
      type: 'checkbox',
      value: false,
      label: 'I am an AARP member (additional 5% discount)',
      props: { color: 'primary' },
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'less',
            value: 65,
          },
        },
      ],
    },
    {
      type: 'submit',
      key: 'submit',
      label: 'Register',
      props: { color: 'primary' },
    },
  ],
} as const satisfies FormConfig;
