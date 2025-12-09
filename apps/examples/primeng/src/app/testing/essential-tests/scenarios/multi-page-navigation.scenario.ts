import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Multi-Page Navigation Test Scenario
 * Tests form submission with multiple input fields
 */
export const multiPageNavigationScenario: TestScenario = {
  testId: 'multi-page-navigation',
  title: 'Multi-Page Navigation',
  description: 'Tests form submission with multiple input fields',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
    },
    fields: [
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        required: true,
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        required: true,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
        email: true,
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
  } as const satisfies FormConfig,
};
