import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    minLength: 'Must be at least {{requiredLength}} characters',
    pattern: 'Invalid format',
  },
  fields: [
    // Page 1: Basic validation
    {
      key: 'basicPage',
      type: 'page',
      fields: [
        {
          key: 'basic-page-title',
          type: 'text',
          label: 'Basic Information',
        },
        {
          key: 'username',
          type: 'input',
          label: 'Username',
          props: {
            placeholder: 'Minimum 3 characters',
          },
          required: true,
          minLength: 3,
          col: 12,
        },
        {
          key: 'nextToPage2',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    // Page 2: Enhanced validation
    {
      key: 'enhancedPage',
      type: 'page',
      fields: [
        {
          key: 'enhanced-page-title',
          type: 'text',
          label: 'Enhanced Security',
        },
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          props: {
            type: 'password',
            placeholder: 'Minimum 8 characters',
          },
          required: true,
          minLength: 8,
          col: 12,
        },
        {
          key: 'securityQuestion',
          type: 'select',
          label: 'Security Question',
          options: [
            { value: 'pet', label: "What was your first pet's name?" },
            { value: 'school', label: 'What was your first school?' },
            { value: 'city', label: 'In what city were you born?' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'securityAnswer',
          type: 'input',
          label: 'Security Answer',
          props: {
            placeholder: 'Answer to security question',
          },
          required: true,
          minLength: 2,
          col: 12,
        },
        {
          key: 'previousToPage1',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToPage3',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 3: Final validation
    {
      key: 'finalValidationPage',
      type: 'page',
      fields: [
        {
          key: 'final-page-title',
          type: 'text',
          label: 'Final Verification',
        },
        {
          key: 'confirmUsername',
          type: 'input',
          label: 'Confirm Username',
          props: {
            placeholder: 'Re-enter your username',
          },
          required: true,
          col: 12,
        },
        {
          key: 'verificationCode',
          type: 'input',
          label: 'Verification Code',
          props: {
            placeholder: 'Enter 6-digit code',
          },
          pattern: '^[0-9]{6}$',
          required: true,
          col: 12,
        },
        {
          key: 'previousToPage2',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitProgressive',
          type: 'submit',
          label: 'Complete Verification',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const progressiveValidationScenario: TestScenario = {
  testId: 'progressive-validation',
  title: 'Progressive Cross-Page Validation',
  description: 'Tests increasing validation requirements across multiple pages',
  config,
};
