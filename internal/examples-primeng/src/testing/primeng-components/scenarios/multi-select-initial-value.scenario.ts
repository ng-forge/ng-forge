import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'permissions',
      type: 'select',
      label: 'Permissions',
      value: ['read', 'write'],
      options: [
        { value: 'read', label: 'Read' },
        { value: 'write', label: 'Write' },
        { value: 'delete', label: 'Delete' },
        { value: 'admin', label: 'Admin' },
      ],
      props: {
        multiple: true,
        placeholder: 'Select permissions',
      },
    },
  ],
} as const satisfies FormConfig;

export const multiSelectInitialValueScenario: TestScenario = {
  testId: 'multi-select-initial-value',
  title: 'Multi-Select - Initial Value',
  description: 'Tests multi-select with pre-selected values',
  config,
};
