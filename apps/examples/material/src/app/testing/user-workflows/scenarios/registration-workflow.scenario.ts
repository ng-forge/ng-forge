import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{requiredLength}} characters',
  },
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      required: true,
      col: 6,
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      required: true,
      col: 6,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      required: true,
      email: true,
      props: {
        type: 'email',
      },
    },
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      required: true,
      minLength: 8,
      props: {
        type: 'password',
      },
      col: 6,
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      required: true,
      minLength: 8,
      props: {
        type: 'password',
      },
      col: 6,
    },
    {
      key: 'agreeTerms',
      type: 'checkbox',
      label: 'I agree to the terms and conditions',
      required: true,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Register',
    },
  ],
} as const satisfies FormConfig;

export const registrationWorkflowScenario: TestScenario = {
  testId: 'registration-workflow',
  title: 'User Registration Workflow',
  description: 'Tests user registration form with validation',
  config,
};
