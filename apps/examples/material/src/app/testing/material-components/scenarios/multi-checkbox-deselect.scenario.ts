import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'permissions',
      type: 'multi-checkbox',
      label: 'Permissions',
      options: [
        { value: 'read', label: 'Read' },
        { value: 'write', label: 'Write' },
        { value: 'delete', label: 'Delete' },
      ],
      value: ['read', 'write'],
    },
  ],
} as const satisfies FormConfig;

export const multiCheckboxDeselectScenario: TestScenario = {
  testId: 'multi-checkbox-deselect',
  title: 'Multi-Checkbox - Deselect Options',
  description: 'Tests deselecting multi-checkbox options',
  config,
  initialValue: {
    permissions: ['read', 'write'],
  },
};
