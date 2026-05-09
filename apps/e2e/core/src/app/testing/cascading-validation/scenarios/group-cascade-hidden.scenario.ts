import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * A hidden group cascades hiddenness to descendants — required leaves inside
 * the group skip validation by default. Toggling the group's visibility
 * toggles whether those required validators fire.
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'showAddress',
      type: 'checkbox',
      label: 'Show Address Group',
      value: false,
    },
    {
      key: 'address',
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
          required: true,
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          required: true,
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const groupCascadeHiddenScenario: TestScenario = {
  testId: 'group-cascade-hidden',
  title: 'Group Cascade — Hidden Group Skips Required Children',
  description: 'A hidden group cascades hiddenness, so its required leaves skip validation by default',
  config,
  simulateSubmission: { delayMs: 0 },
};
