import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * ARIA Attributes Test Scenario
 * Tests that input fields have proper ARIA attributes for accessibility
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{requiredLength}} characters',
  },
  fields: [
    {
      key: 'requiredField',
      type: 'input',
      label: 'Required Field',
      required: true,
      props: {
        hint: 'This field is required for submission',
      },
    },
    {
      key: 'emailField',
      type: 'input',
      label: 'Email Address',
      required: true,
      props: {
        type: 'email',
        hint: 'Enter your email address',
      },
    },
    {
      key: 'optionalField',
      type: 'input',
      label: 'Optional Field',
      props: {
        hint: 'This field is optional',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const ariaAttributesScenario: TestScenario = {
  testId: 'aria-attributes',
  title: 'ARIA Attributes',
  description: 'Tests aria-invalid, aria-required, and aria-describedby attributes on input fields',
  config,
};
