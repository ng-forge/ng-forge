import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Error Announcements Test Scenario
 * Tests that validation errors are properly announced to screen readers
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    minLength: 'Must be at least {{requiredLength}} characters',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      required: true,
      minLength: 3,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      required: true,
      props: {
        type: 'email',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const errorAnnouncementsScenario: TestScenario = {
  testId: 'error-announcements',
  title: 'Error Announcements',
  description: 'Tests that validation errors have role="alert" for screen reader announcements',
  config,
};
