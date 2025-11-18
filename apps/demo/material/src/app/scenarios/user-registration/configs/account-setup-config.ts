import { FormConfig } from '@ng-forge/dynamic-form';

export const accountSetupConfig = {
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Account Setup',
      props: {
        elementType: 'h2',
      },
      col: 12,
    },
    {
      key: 'description',
      type: 'text',
      label: 'Create your account credentials and security settings.',
      col: 12,
    },
    {
      key: 'credentials',
      type: 'group',
      label: 'Login Credentials',
      fields: [
        {
          key: 'username',
          type: 'input',
          label: 'Username',
          props: {
            placeholder: 'Choose a unique username',
          },
          required: true,
          minLength: 3,
          col: 12,
        },
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          props: {
            type: 'password',
            placeholder: 'Create a strong password',
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
          },
          required: true,
          minLength: 8,
          col: 6,
        },
      ],
      col: 12,
    },
    {
      key: 'security',
      type: 'group',
      label: 'Security Questions',
      fields: [
        {
          key: 'securityQuestion1',
          type: 'select',
          label: 'Security Question 1',
          options: [
            { value: 'pet', label: "What was your first pet's name?" },
            { value: 'school', label: 'What was your first school?' },
            { value: 'city', label: 'In what city were you born?' },
            { value: 'maiden', label: "What is your mother's maiden name?" },
          ],
          props: {
            placeholder: 'Choose a security question',
          },
          required: true,
          col: 6,
        },
        {
          key: 'securityAnswer1',
          type: 'input',
          label: 'Answer',
          props: {
            placeholder: 'Enter your answer',
          },
          required: true,
          col: 6,
        },
        {
          key: 'securityQuestion2',
          type: 'select',
          label: 'Security Question 2',
          options: [
            { value: 'book', label: 'What is your favorite book?' },
            { value: 'teacher', label: 'Who was your favorite teacher?' },
            { value: 'car', label: 'What was your first car?' },
            { value: 'street', label: 'What street did you grow up on?' },
          ],
          props: {
            placeholder: 'Choose another security question',
          },
          required: true,
          col: 6,
        },
        {
          key: 'securityAnswer2',
          type: 'input',
          label: 'Answer',
          props: {
            placeholder: 'Enter your answer',
          },
          required: true,
          col: 6,
        },
      ],
      col: 12,
    },
    {
      key: 'preferences',
      type: 'group',
      label: 'Account Preferences',
      fields: [
        {
          key: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to our newsletter for updates and promotions',
          props: {
            color: 'primary',
          },
          col: 12,
        },
        {
          key: 'twoFactorAuth',
          type: 'checkbox',
          label: 'Enable two-factor authentication for enhanced security',
          props: {
            color: 'primary',
          },
          col: 12,
        },
        {
          key: 'accountType',
          type: 'radio',
          label: 'Account Type',
          options: [
            { value: 'personal', label: 'Personal Account' },
            { value: 'business', label: 'Business Account' },
          ],
          required: true,
          col: 12,
        },
      ],
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Continue to Confirmation',
      props: {
        color: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;
