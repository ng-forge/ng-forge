import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'skills',
      type: 'multi-checkbox',
      label: 'Select Your Skills',
      required: true,
      options: [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'angular', label: 'Angular' },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const multiCheckboxArrayScenario: TestScenario = {
  testId: 'multi-checkbox-array',
  title: 'Multi-Checkbox - Array',
  description: 'Multi-checkbox with array value submission',
  config,
};
