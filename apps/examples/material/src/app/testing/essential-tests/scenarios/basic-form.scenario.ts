import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Basic Form Functionality Test Scenario
 * Tests fundamental form functionality with password validation
 */
export const basicFormScenario: TestScenario = {
  testId: 'basic-form',
  title: 'Basic Form Functionality',
  description: 'Tests fundamental form functionality with password fields',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        required: true,
        props: {
          type: 'password',
        },
      },
      {
        key: 'confirmPassword',
        type: 'input',
        label: 'Confirm Password',
        required: true,
        props: {
          type: 'password',
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
