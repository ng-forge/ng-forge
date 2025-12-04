import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'termsAcceptance',
      type: 'toggle',
      label: 'I accept the terms',
      required: true,
      value: false,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const toggleValidationScenario: TestScenario = {
  testId: 'toggle-validation',
  title: 'Toggle - Required Validation',
  description: 'Tests toggle required validation',
  config,
};
