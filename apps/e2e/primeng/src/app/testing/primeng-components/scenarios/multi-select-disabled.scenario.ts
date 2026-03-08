import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'lockedSelection',
      type: 'select',
      label: 'Locked Selection',
      value: ['option1', 'option2'],
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
      disabled: true,
      props: {
        multiple: true,
      },
    },
  ],
} as const satisfies FormConfig;

export const multiSelectDisabledScenario: TestScenario = {
  testId: 'multi-select-disabled',
  title: 'Multi-Select - Disabled',
  description: 'Tests disabled multi-select',
  config,
};
