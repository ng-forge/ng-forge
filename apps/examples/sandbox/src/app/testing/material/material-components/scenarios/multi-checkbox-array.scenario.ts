import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'skills',
      type: 'multi-checkbox',
      label: 'Skills',
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
  title: 'Multi-Checkbox - Array Values',
  description: 'Tests multi-checkbox collecting values as array',
  config,
};
