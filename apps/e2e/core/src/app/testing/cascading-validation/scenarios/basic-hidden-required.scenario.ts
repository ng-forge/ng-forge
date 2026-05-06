import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Baseline behavior: a field that is `hidden: true` and `required: true` does
 * NOT block submission by default. Validators on hidden fields are skipped
 * (validateWhenHidden defaults to false).
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'visibleField',
      type: 'input',
      label: 'Visible Field',
      placeholder: 'Optional',
    },
    {
      key: 'hiddenRequired',
      type: 'input',
      label: 'Hidden Required',
      hidden: true,
      required: true,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const basicHiddenRequiredScenario: TestScenario = {
  testId: 'basic-hidden-required',
  title: 'Basic — Hidden Required Field',
  description: 'Validators on a statically hidden required field are skipped by default — submit stays enabled',
  config,
  simulateSubmission: { delayMs: 0 },
};
