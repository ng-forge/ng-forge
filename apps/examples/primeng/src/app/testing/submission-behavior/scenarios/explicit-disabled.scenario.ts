import { TestScenario } from '../../shared/types';

/**
 * Explicit Disabled Scenario
 * Tests that explicit disabled: true always wins over logic
 */
export const explicitDisabledScenario: TestScenario = {
  testId: 'explicit-disabled',
  title: 'Explicit Disabled',
  description: 'Tests that explicit disabled: true always wins over logic. This button is always disabled regardless of form state.',
  config: {
    fields: [
      {
        key: 'email3',
        type: 'input',
        label: 'Email',
        props: { type: 'email', placeholder: 'Enter email' },
        col: 12,
      },
      {
        key: 'submitExplicit',
        type: 'submit',
        label: 'Submit (always disabled)',
        col: 12,
        disabled: true,
      },
    ],
  },
  initialValue: {},
};
