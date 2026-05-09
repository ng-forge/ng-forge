import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Toggling a required field's visibility via `hidden` logic should toggle
 * whether its validators run. When the toggle hides the field, the form
 * becomes valid; when it shows the field, the empty value triggers required.
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'showName',
      type: 'checkbox',
      label: 'Show Name Field',
      value: true,
    },
    {
      key: 'name',
      type: 'input',
      label: 'Name',
      required: true,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'showName',
            operator: 'equals',
            value: false,
          },
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

export const toggleHiddenRequiredScenario: TestScenario = {
  testId: 'toggle-hidden-required',
  title: 'Toggle — Hidden Required Field',
  description: 'Toggling visibility via hidden-logic toggles whether the required validator runs',
  config,
  simulateSubmission: { delayMs: 0 },
};
