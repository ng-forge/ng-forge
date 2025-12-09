import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'permissions',
      type: 'multi-checkbox',
      label: 'Select Permissions',
      required: true,
      options: [
        { value: 'read', label: 'Read' },
        { value: 'write', label: 'Write' },
        { value: 'delete', label: 'Delete' },
      ],
    },
  ],
} as const satisfies FormConfig;

export const multiCheckboxDeselectScenario: TestScenario = {
  testId: 'multi-checkbox-deselect',
  title: 'Multi-Checkbox - Deselect',
  description: 'Multi-checkbox with initial values that can be deselected',
  config,
  initialValue: {
    permissions: ['read', 'write'],
  },
};
