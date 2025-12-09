import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'interests',
      type: 'multi-checkbox',
      label: 'Select Your Interests',
      required: true,
      options: [
        { value: 'sports', label: 'Sports' },
        { value: 'music', label: 'Music' },
        { value: 'reading', label: 'Reading' },
      ],
    },
  ],
} as const satisfies FormConfig;

export const multiCheckboxBasicScenario: TestScenario = {
  testId: 'multi-checkbox-basic',
  title: 'Multi-Checkbox - Basic',
  description: 'Basic multi-checkbox functionality',
  config,
};
