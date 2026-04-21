import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    min: 'Value must be at least {{min}}',
  },
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      required: true,
      placeholder: 'Enter first name',
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      required: true,
      placeholder: 'Enter last name',
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      email: true,
      required: true,
      placeholder: 'user@example.com',
      props: {
        type: 'email',
      },
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      required: true,
      min: 18,
      placeholder: '18',
      props: {
        type: 'number',
      },
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      required: true,
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Create Account',
    },
  ],
} as const satisfies FormConfig;

export const userRegistrationScenario: TestScenario = {
  testId: 'user-registration',
  title: 'User Registration',
  description: 'Tests a standard user registration form with multiple field types',
  config,
};
