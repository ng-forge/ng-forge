import { FormConfig } from '@ng-forge/dynamic-forms';

export const userRegistrationConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      type: 'page',
      key: 'accountPage',
      fields: [
        {
          type: 'text',
          key: 'accountText',
          label: 'Create your account',
          props: { elementType: 'h3' },
        },
        {
          key: 'username',
          type: 'input',
          value: '',
          label: 'Username',
          required: true,
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-zA-Z0-9_]+$',
          validationMessages: {
            required: 'Username is required',
            minLength: 'Username must be at least 3 characters',
            maxLength: 'Username cannot exceed 20 characters',
            pattern: 'Username can only contain letters, numbers, and underscores',
          },
          props: {
            hint: '3-20 characters, letters, numbers, and underscores only',
          },
        },
        {
          key: 'email',
          type: 'input',
          value: '',
          label: 'Email Address',
          required: true,
          email: true,
          validationMessages: {
            required: 'Email is required',
            email: 'Please enter a valid email address',
          },
          props: {
            type: 'email',
            hint: "We'll send a verification email",
          },
        },
        {
          key: 'password',
          type: 'input',
          value: '',
          label: 'Password',
          required: true,
          minLength: 8,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$',
          validationMessages: {
            required: 'Password is required',
            minLength: 'Password must be at least 8 characters',
            pattern: 'Password must include uppercase, lowercase, number, and special character',
          },
          props: {
            type: 'password',
            hint: 'At least 8 characters with uppercase, lowercase, number, and special character',
          },
        },
        {
          key: 'confirmPassword',
          type: 'input',
          value: '',
          label: 'Confirm Password',
          required: true,
          validators: [
            {
              type: 'custom',
              expression: 'fieldValue === formValue.password',
              kind: 'passwordMismatch',
            },
          ],
          validationMessages: {
            required: 'Please confirm your password',
            passwordMismatch: 'Passwords do not match',
          },
          props: {
            type: 'password',
          },
        },
        {
          type: 'next',
          key: 'nextToProfile',
          label: 'Continue to Profile',
        },
      ],
    },
    {
      type: 'page',
      key: 'profilePage',
      fields: [
        {
          type: 'row',
          key: 'nameRow',
          fields: [
            {
              key: 'firstName',
              type: 'input',
              value: '',
              label: 'First Name',
              required: true,
              col: 6,
            },
            {
              key: 'lastName',
              type: 'input',
              value: '',
              label: 'Last Name',
              required: true,
              col: 6,
            },
          ],
        },
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
          key: 'industry',
          type: 'select',
          value: '',
          label: 'Industry',
          options: [
            { value: 'tech', label: 'Technology' },
            { value: 'finance', label: 'Finance' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'retail', label: 'Retail' },
            { value: 'education', label: 'Education' },
            { value: 'other', label: 'Other' },
          ],
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
          placeholder: 'Select your industry',
        },
        {
          type: 'row',
          key: 'navigationRow',
          fields: [
            {
              type: 'previous',
              key: 'backToAccount',
              label: 'Back',
            },
            {
              type: 'next',
              key: 'nextToPreferences',
              label: 'Continue',
            },
          ],
        },
      ],
    },
    {
      type: 'page',
      key: 'preferencesPage',
      fields: [
        {
          key: 'interests',
          type: 'multi-checkbox',
          value: [],
          label: 'Interests',
          options: [
            { value: 'tech', label: 'Technology & Innovation' },
            { value: 'business', label: 'Business & Entrepreneurship' },
            { value: 'design', label: 'Design & Creativity' },
            { value: 'marketing', label: 'Marketing & Sales' },
            { value: 'development', label: 'Software Development' },
          ],
        },
        {
          key: 'newsletter',
          type: 'checkbox',
          value: false,
          label: 'Subscribe to newsletter',
        },
        {
          key: 'notifications',
          type: 'toggle',
          value: true,
          label: 'Enable email notifications',
        },
        {
          key: 'terms',
          type: 'checkbox',
          value: false,
          label: 'I accept the terms and conditions',
          required: true,
          validationMessages: {
            required: 'You must accept the terms and conditions',
          },
        },
        {
          key: 'privacy',
          type: 'checkbox',
          value: false,
          label: 'I have read and accept the privacy policy',
          required: true,
          validationMessages: {
            required: 'You must accept the privacy policy',
          },
        },
        {
          type: 'row',
          key: 'finalNavigationRow',
          fields: [
            {
              type: 'previous',
              key: 'backToProfile',
              label: 'Back',
            },
            {
              type: 'submit',
              key: 'submitRegistration',
              label: 'Create Account',
            },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
