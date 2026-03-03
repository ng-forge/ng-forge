import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'At least one option must be selected',
  },
  fields: [
    {
      key: 'requiredChoices',
      type: 'multi-checkbox',
      label: 'Required Choices',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
      required: true,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const multiCheckboxValidationScenario: TestScenario = {
  testId: 'multi-checkbox-validation',
  title: 'Multi-Checkbox - Required Validation',
  description: 'Tests multi-checkbox required validation',
  config,
};
