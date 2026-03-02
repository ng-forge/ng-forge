import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'interests',
      type: 'multi-checkbox',
      label: 'Interests',
      options: [
        { value: 'sports', label: 'Sports' },
        { value: 'music', label: 'Music' },
        { value: 'reading', label: 'Reading' },
        { value: 'gaming', label: 'Gaming' },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const checkboxArrayComponentScenario: TestScenario = {
  testId: 'checkbox-array-component',
  title: 'Checkbox Array - Basic',
  description: 'Tests array of ion-checkboxes',
  config,
};
