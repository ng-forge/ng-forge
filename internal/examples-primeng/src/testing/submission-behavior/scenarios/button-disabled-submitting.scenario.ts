import { TestScenario } from '../../shared/types';

/**
 * Button Disabled During Submission Scenario
 * Tests that submit button is disabled while the form is submitting via HTTP
 */
export const buttonDisabledSubmittingScenario: TestScenario = {
  testId: 'button-disabled-submitting',
  title: 'Submit Button Disabled During Submission',
  description:
    'Tests that the submit button is disabled while the form is submitting. Click submit to see the button become disabled during the HTTP request.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'email2',
        type: 'input',
        label: 'Email',
        props: { type: 'email', placeholder: 'Enter email' },
        required: true,
        col: 6,
      },
      {
        key: 'name2',
        type: 'input',
        label: 'Name',
        props: { placeholder: 'Enter name' },
        required: true,
        col: 6,
      },
      {
        key: 'submitSubmitting',
        type: 'submit',
        label: 'Submit (disabled during submission)',
        col: 12,
      },
    ],
  },
  initialValue: {
    email2: 'valid@example.com',
    name2: 'Valid Name',
  },
  mockEndpoint: {
    url: '/api/submit-disabled-test',
    method: 'POST',
  },
};
