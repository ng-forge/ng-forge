import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test submission behavior when a container has container-level hidden logic.
 * Verifies that child values of a hidden container are still included in the
 * submitted form data (V1 behavior: CSS-only hiding, not form model removal).
 */
const config = {
  fields: [
    {
      key: 'showAddress',
      type: 'checkbox',
      label: 'Show Address',
      value: true,
    },
    {
      key: 'name',
      type: 'input',
      label: 'Name',
      value: 'Test User',
      props: { placeholder: 'Enter name' },
    },
    {
      key: 'addressGroup',
      type: 'group',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'showAddress',
            operator: 'equals',
            value: false,
          },
        },
      ],
      fields: [
        {
          key: 'street',
          type: 'input',
          label: 'Street',
          value: '123 Main St',
          props: { placeholder: 'Enter street' },
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          value: 'Springfield',
          props: { placeholder: 'Enter city' },
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: { type: 'submit', color: 'primary' },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const containerLevelSubmissionScenario: TestScenario = {
  testId: 'container-level-submission',
  title: 'Submit with Container-Level Hidden Logic',
  description: 'Verify that form submission includes child values when the container itself is hidden via logic',
  config,
  simulateSubmission: { delayMs: 0 },
};
