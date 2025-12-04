import { TestScenario } from '../../shared/types';

/**
 * FormStateCondition Logic Scenario
 * Tests that submit button uses FormStateCondition logic with HTTP submission
 */
export const formStateConditionScenario: TestScenario = {
  testId: 'form-state-condition',
  title: 'FormStateCondition Logic',
  description:
    "Tests that submit button uses FormStateCondition logic. The button is disabled when 'formSubmitting' is true (during HTTP request).",
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        props: { type: 'email', placeholder: 'Enter email' },
        required: true,
        col: 6,
      },
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        props: { placeholder: 'Enter name' },
        required: true,
        col: 6,
      },
      {
        key: 'submitFormState',
        type: 'submit',
        label: 'Submit (uses formSubmitting condition)',
        col: 12,
        logic: [
          {
            type: 'disabled',
            condition: 'formSubmitting',
          },
        ],
      },
    ],
  },
  initialValue: {
    email: 'valid@example.com',
    name: 'Valid Name',
  },
  mockEndpoint: {
    url: '/api/form-state-submit',
    method: 'POST',
  },
};
