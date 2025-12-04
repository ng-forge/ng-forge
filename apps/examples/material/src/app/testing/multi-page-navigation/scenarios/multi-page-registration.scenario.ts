import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{requiredLength}} characters',
    pattern: 'Invalid format',
  },
  fields: [
    // Page 1: Account Setup
    {
      key: 'accountPage',
      type: 'page',
      fields: [
        {
          key: 'accountPage-title',
          type: 'text',
          label: 'Account Setup',
          col: 12,
        },
        {
          key: 'accountPage-description',
          type: 'text',
          label: 'Create your account credentials',
          col: 12,
        },
        {
          key: 'username',
          type: 'input',
          label: 'Username',
          props: {
            placeholder: 'Enter username',
          },
          required: true,
          minLength: 3,
          col: 6,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email Address',
          props: {
            type: 'email',
            placeholder: 'Enter email',
          },
          email: true,
          required: true,
          col: 6,
        },
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          props: {
            type: 'password',
            placeholder: 'Enter password',
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
            placeholder: 'Confirm password',
          },
          required: true,
          col: 6,
        },
        {
          key: 'nextToPersonalPage',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    // Page 2: Personal Information
    {
      key: 'personalPage',
      type: 'page',
      fields: [
        {
          key: 'personalPage-title',
          type: 'text',
          label: 'Personal Information',
          col: 12,
        },
        {
          key: 'personalPage-description',
          type: 'text',
          label: 'Tell us about yourself',
          col: 12,
        },
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          props: {
            placeholder: 'Enter first name',
          },
          required: true,
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          props: {
            placeholder: 'Enter last name',
          },
          required: true,
          col: 6,
        },
        {
          key: 'birthDate',
          type: 'datepicker',
          label: 'Date of Birth',
          required: true,
          col: 6,
        },
        {
          key: 'phoneNumber',
          type: 'input',
          label: 'Phone Number',
          props: {
            type: 'tel',
            placeholder: 'Enter phone number',
          },
          pattern: '^[+]?[0-9\\s\\-\\(\\)]+$',
          col: 6,
        },
        {
          key: 'previousToAccountPage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToPreferencesPage',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 3: Preferences
    {
      key: 'preferencesPage',
      type: 'page',
      fields: [
        {
          key: 'preferencesPage-title',
          type: 'text',
          label: 'Preferences',
          col: 12,
        },
        {
          key: 'preferencesPage-description',
          type: 'text',
          label: 'Customize your experience',
          col: 12,
        },
        {
          key: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to newsletter',
          col: 12,
        },
        {
          key: 'language',
          type: 'select',
          label: 'Preferred Language',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
          ],
          value: 'en',
          col: 6,
        },
        {
          key: 'timezone',
          type: 'select',
          label: 'Timezone',
          options: [
            { value: 'UTC', label: 'UTC' },
            { value: 'EST', label: 'Eastern Time' },
            { value: 'PST', label: 'Pacific Time' },
            { value: 'GMT', label: 'Greenwich Mean Time' },
          ],
          col: 6,
        },
        {
          key: 'terms',
          type: 'checkbox',
          label: 'I agree to the Terms of Service',
          required: true,
          col: 12,
        },
        {
          key: 'previousToPersonalPage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitRegistration',
          type: 'submit',
          label: 'Complete Registration',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const multiPageRegistrationScenario: TestScenario = {
  testId: 'multi-page-registration',
  title: 'Multi-Page Registration Wizard',
  description: 'Tests 3-page registration workflow with account setup, personal information, and preferences',
  config,
};
