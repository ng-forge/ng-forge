import { TestScenario } from '../../shared/types';

/**
 * Conditional Expression Logic Scenario
 * Tests that submit button can use conditional expressions
 */
export const conditionalExpressionScenario: TestScenario = {
  testId: 'conditional-expression',
  title: 'Conditional Expression Logic',
  description:
    "Tests that submit button can use conditional expressions. The button is disabled when the 'disableSubmit' checkbox is checked.",
  config: {
    fields: [
      {
        key: 'email2',
        type: 'input',
        label: 'Email',
        props: { type: 'email', placeholder: 'Enter email' },
        col: 6,
      },
      {
        key: 'disableSubmit',
        type: 'checkbox',
        label: 'Disable submit button',
        col: 6,
      },
      {
        key: 'submitConditional',
        type: 'submit',
        label: 'Submit (disabled when checkbox checked)',
        col: 12,
        logic: [
          {
            type: 'disabled',
            condition: {
              type: 'fieldValue',
              fieldPath: 'disableSubmit',
              operator: 'equals',
              value: true,
            },
          },
        ],
      },
    ],
  },
  initialValue: {},
};
