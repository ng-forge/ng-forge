import { TestScenario } from '../../shared/types';

/**
 * Submit Button Inside Group Scenario
 * Tests that submit button is properly disabled when form is invalid,
 * even when the submit button is nested inside a group field.
 * This verifies fix for issue #157.
 */
export const submitInsideGroupScenario: TestScenario = {
  testId: 'submit-inside-group',
  title: 'Submit Button Inside Group',
  description:
    'Tests that the submit button inside a group field correctly checks the root form validity. The submit button should be disabled when any field in the form is invalid, not just fields in the same group.',
  config: {
    defaultValidationMessages: {
      required: 'This field is required',
    },
    fields: [
      {
        key: 'email',
        type: 'input',
        label: 'Email (required, outside group)',
        props: { type: 'email', placeholder: 'Enter email' },
        required: true,
        col: 6,
      },
      {
        key: 'name',
        type: 'input',
        label: 'Name (required, outside group)',
        props: { placeholder: 'Enter name' },
        required: true,
        col: 6,
      },
      {
        key: 'actionsGroup',
        type: 'group',
        col: 12,
        fields: [
          {
            key: 'submitInGroup',
            type: 'submit',
            label: 'Submit (inside group)',
            col: 12,
          },
        ],
      },
    ],
  },
  initialValue: {},
};
