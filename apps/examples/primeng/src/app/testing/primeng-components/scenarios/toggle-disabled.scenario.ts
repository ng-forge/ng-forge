import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'lockedToggle',
      type: 'toggle',
      label: 'Locked Toggle',
      value: true,
      disabled: true,
    },
  ],
} as const satisfies FormConfig;

export const toggleDisabledScenario: TestScenario = {
  testId: 'toggle-disabled',
  title: 'Toggle - Disabled',
  description: 'Disabled toggle that cannot be interacted with',
  config,
};
