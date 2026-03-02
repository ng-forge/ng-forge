import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'features',
      type: 'multi-checkbox',
      label: 'Features',
      options: [
        { value: 'feature1', label: 'Feature 1' },
        { value: 'feature2', label: 'Feature 2', disabled: true },
        { value: 'feature3', label: 'Feature 3' },
      ],
    },
  ],
} as const satisfies FormConfig;

export const multiCheckboxDisabledOptionsScenario: TestScenario = {
  testId: 'multi-checkbox-disabled-options',
  title: 'Multi-Checkbox - Disabled Options',
  description: 'Tests multi-checkbox with disabled options',
  config,
};
