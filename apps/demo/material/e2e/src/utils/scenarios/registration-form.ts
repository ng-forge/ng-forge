import { FormConfig } from '@ng-forge/dynamic-form';

/**
 * Registration Form - Complex validation with password confirmation
 */
export const registrationFormConfig = {
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      required: true,
      defaultValue: 'newuser123',
      validators: [
        { type: 'required' },
        { type: 'minLength', value: 3 },
        { type: 'pattern', value: '^[a-zA-Z0-9_]+$', errorMessage: 'Only letters, numbers, and underscores allowed' },
      ],
      col: 6,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      required: true,
      defaultValue: 'newuser@example.com',
      props: { type: 'email' },
      validators: [{ type: 'required' }, { type: 'email' }],
      col: 6,
    },
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      required: true,
      defaultValue: 'SecurePass123!',
      props: { type: 'password' },
      validators: [
        { type: 'required' },
        { type: 'minLength', value: 8, errorMessage: 'Password must be at least 8 characters' },
        {
          type: 'pattern',
          value: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
          errorMessage: 'Password must contain uppercase, lowercase, and number',
        },
      ],
      col: 6,
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      required: true,
      defaultValue: 'SecurePass123!',
      props: { type: 'password' },
      validators: [{ type: 'required' }],
      col: 6,
    },
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      required: true,
      defaultValue: 'New',
      validators: [{ type: 'required' }, { type: 'minLength', value: 2 }],
      col: 6,
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      required: true,
      defaultValue: 'User',
      validators: [{ type: 'required' }, { type: 'minLength', value: 2 }],
      col: 6,
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      required: true,
      defaultValue: '25',
      props: { type: 'number' },
      min: 18,
      max: 120,
      validators: [
        { type: 'required' },
        { type: 'min', value: 18, errorMessage: 'You must be at least 18 years old' },
        { type: 'max', value: 120 },
      ],
      col: 4,
    },
    {
      key: 'agreeToTerms',
      type: 'checkbox',
      label: 'I agree to the Terms and Conditions',
      required: true,
      defaultValue: false,
      validators: [{ type: 'required', errorMessage: 'You must agree to the terms' }],
    },
    {
      key: 'subscribeNewsletter',
      type: 'checkbox',
      label: 'Subscribe to newsletter',
      defaultValue: false,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Create Account',
      props: {
        color: 'primary',
      },
    },
  ],
} as const satisfies FormConfig;
