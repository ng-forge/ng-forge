import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Form-level override: setting `options.validateWhenHidden: true` makes the
 * entire form validate hidden fields by default. A required leaf inside a
 * hidden group still blocks submission without per-field opt-in.
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  options: {
    validateWhenHidden: true,
  },
  fields: [
    {
      key: 'visibleField',
      type: 'input',
      label: 'Visible Field',
    },
    {
      key: 'hiddenSection',
      type: 'group',
      hidden: true,
      fields: [
        {
          key: 'mustValidate',
          type: 'input',
          label: 'Required even when ancestor hidden (form-level)',
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

export const formValidateWhenHiddenScenario: TestScenario = {
  testId: 'form-validate-when-hidden',
  title: 'Form-Level Override — options.validateWhenHidden=true',
  description: 'Form-level option flips the default — required leaves inside hidden groups keep blocking submit',
  config,
  initialValue: { visibleField: '', hiddenSection: { mustValidate: '' } },
  simulateSubmission: { delayMs: 0 },
};
