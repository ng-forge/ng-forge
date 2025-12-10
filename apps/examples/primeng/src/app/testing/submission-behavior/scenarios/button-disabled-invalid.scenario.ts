import { TestScenario } from '../../shared/types';

/**
 * Button Disabled When Invalid Scenario
 * Tests that submit button is disabled when form is invalid (default behavior)
 */
export const buttonDisabledInvalidScenario: TestScenario = {
  testId: 'button-disabled-invalid',
  title: 'Submit Button Disabled When Invalid',
  description:
    'Tests that the submit button is disabled when the form is invalid (default behavior). Fill all required fields to enable the submit button.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email (required)',
        props: { type: 'email', placeholder: 'Enter email' },
        required: true,
        col: 6,
      },
      {
        key: 'name',
        type: 'input',
        label: 'Name (required)',
        props: { placeholder: 'Enter name' },
        required: true,
        col: 6,
      },
      {
        key: 'submitInvalid',
        type: 'submit',
        label: 'Submit (disabled when invalid)',
        col: 12,
      },
    ],
  },
  initialValue: {},
};
