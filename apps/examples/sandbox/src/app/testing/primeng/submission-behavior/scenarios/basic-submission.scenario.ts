import { TestScenario } from '../../shared/types';

/**
 * Basic Submission Scenario
 * Tests form submission via HTTP endpoint
 */
export const basicSubmissionScenario: TestScenario = {
  testId: 'basic-submission',
  title: 'Basic Submission',
  description: 'Tests form submission using HTTP POST. The submit button should be disabled while submitting.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: {
          type: 'email',
          placeholder: 'Enter email',
        },
        required: true,
        col: 6,
      },
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        props: {
          placeholder: 'Enter name',
        },
        required: true,
        col: 6,
      },
      {
        key: 'submitForm',
        type: 'submit',
        label: 'Submit',
        col: 12,
      },
    ],
  },
  initialValue: {},
  mockEndpoint: {
    url: '/api/basic-submit',
    method: 'POST',
  },
};
