import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    // Page 1: Required fields
    {
      key: 'page1',
      type: 'page',
      fields: [
        {
          key: 'page1-title',
          type: 'text',
          label: 'Required Information',
          col: 12,
        },
        {
          key: 'requiredField',
          type: 'input',
          label: 'Required Field',
          props: {
            placeholder: 'This field is required',
          },
          required: true,
          col: 12,
        },
        {
          key: 'emailField',
          type: 'input',
          label: 'Email',
          props: {
            type: 'email',
            placeholder: 'Enter valid email',
          },
          email: true,
          required: true,
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
    // Page 2: Optional fields
    {
      key: 'page2',
      type: 'page',
      fields: [
        {
          key: 'page2-title',
          type: 'text',
          label: 'Additional Details',
          col: 12,
        },
        {
          key: 'optionalField',
          type: 'input',
          label: 'Optional Field',
          props: {
            placeholder: 'This field is optional',
          },
          col: 12,
        },
        {
          key: 'previousToPage1',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitValidation',
          type: 'submit',
          label: 'Submit Form',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const validationNavigationScenario: TestScenario = {
  testId: 'validation-navigation',
  title: 'Navigation with Validation',
  description: 'Tests page navigation with required field validation',
  config,
};
