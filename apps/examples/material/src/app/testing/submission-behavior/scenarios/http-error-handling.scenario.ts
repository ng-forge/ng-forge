import { TestScenario } from '../../shared/types';

/**
 * HTTP Error Handling Scenario
 * Tests HTTP error responses (500, 422) using real HTTP calls intercepted by Playwright
 */
export const httpErrorHandlingScenario: TestScenario = {
  testId: 'http-error-handling',
  title: 'HTTP Error Handling',
  description: 'Tests HTTP error responses (500 server errors, 422 validation errors) and how the form handles them.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        props: {
          placeholder: 'Enter username',
        },
        required: true,
        col: 6,
      },
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
        key: 'message',
        type: 'input',
        label: 'Message',
        props: {
          placeholder: 'Enter message',
        },
        col: 12,
      },
      {
        key: 'submitErrorTest',
        type: 'submit',
        label: 'Submit',
        col: 12,
      },
    ],
  },
  initialValue: {},
  mockEndpoint: {
    url: '/api/error-handling-test',
    method: 'POST',
  },
};
