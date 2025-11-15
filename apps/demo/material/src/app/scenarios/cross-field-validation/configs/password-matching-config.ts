import { FormConfig } from '@ng-forge/dynamic-form';

export const passwordMatchingConfig = {
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Password Validation Demo',
      props: {
        elementType: 'h2',
      },
      col: 12,
    },
    {
      key: 'description',
      type: 'text',
      label: 'This form demonstrates cross-field validation with password confirmation.',
      col: 12,
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
      key: 'password',
      type: 'input',
      label: 'Password',
      props: {
        type: 'password',
        placeholder: 'Enter a strong password',
        appearance: 'outline',
      },
      required: true,
      minLength: 8,
      col: 6,
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      props: {
        type: 'password',
        placeholder: 'Confirm your password',
        appearance: 'outline',
      },
      required: true,
      minLength: 8,
      validationMessages: {
        passwordMismatch: 'Passwords must match',
      },
      col: 6,
    },
    {
      key: 'passwordHint',
      type: 'text',
      label: 'Password must contain at least 8 characters.',
      className: 'password-hint',
      col: 12,
    },
    {
      key: 'submit',
      type: 'button',
      label: 'Create Account',
      props: {
        type: 'submit',
        color: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;
