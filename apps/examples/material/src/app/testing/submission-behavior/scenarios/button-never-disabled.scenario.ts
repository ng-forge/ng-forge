import { TestScenario } from '../../shared/types';

/**
 * Button Never Auto-Disabled Scenario
 * Tests that form options can disable the default button behavior
 */
export const buttonNeverDisabledScenario: TestScenario = {
  testId: 'button-never-disabled',
  title: 'Submit Button Never Auto-Disabled',
  description: 'Tests that form options can disable the default behavior. This submit button should never be auto-disabled.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
    },
    fields: [
      {
        key: 'email3',
        type: 'input',
        label: 'Email (required but button stays enabled)',
        props: { type: 'email', placeholder: 'Enter email' },
        required: true,
        col: 6,
      },
      {
        key: 'submitNeverDisabled',
        type: 'submit',
        label: 'Submit (never auto-disabled)',
        col: 12,
      },
    ],
    options: {
      submitButton: {
        disableWhenInvalid: false,
        disableWhileSubmitting: false,
      },
    },
  },
  initialValue: {},
};
