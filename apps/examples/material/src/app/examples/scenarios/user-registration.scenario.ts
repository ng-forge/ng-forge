import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const userRegistrationScenario: ExampleScenario = {
  id: 'user-registration',
  title: 'User Registration',
  description: 'Complete user registration form with validation, conditional logic, and multi-step wizard.',
  config: {
    fields: [
      // Step 1: Account Information
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
              appearance: 'outline',
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
              appearance: 'outline',
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
              appearance: 'outline',
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
              appearance: 'outline',
            },
          },
          {
            type: 'next',
            key: 'nextToProfile',
            label: 'Continue to Profile',
            props: { color: 'primary' },
          },
        ],
      },

      // Step 2: Profile Information
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
                props: { appearance: 'outline' },
              },
              {
                key: 'lastName',
                type: 'input',
                value: '',
                label: 'Last Name',
                required: true,
                col: 6,
                props: { appearance: 'outline' },
              },
            ],
          },
          {
            key: 'dateOfBirth',
            type: 'datepicker',
            value: undefined,
            label: 'Date of Birth',
            required: true,
            maxDate: new Date(new Date().getFullYear() - 13, 0, 1),
            validationMessages: {
              required: 'Date of birth is required',
              maxDate: 'You must be at least 13 years old',
            },
            props: {
              appearance: 'outline',
              hint: 'You must be at least 13 years old',
            },
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
            props: { color: 'primary' },
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
            props: { appearance: 'outline' },
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
            props: {
              appearance: 'outline',
              placeholder: 'Select your industry',
            },
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
                props: { color: 'primary' },
              },
            ],
          },
        ],
      },

      // Step 3: Preferences & Terms
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
            props: { color: 'primary' },
          },
          {
            key: 'newsletter',
            type: 'checkbox',
            value: false,
            label: 'Subscribe to newsletter',
            props: { color: 'primary' },
          },
          {
            key: 'notifications',
            type: 'toggle',
            value: true,
            label: 'Enable email notifications',
            props: { color: 'primary' },
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
            props: { color: 'primary' },
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
            props: { color: 'primary' },
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
                props: { color: 'primary' },
              },
            ],
          },
        ],
      },
    ],
  } as const satisfies FormConfig,
};
