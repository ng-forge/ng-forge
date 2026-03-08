import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

// Note: value is computed at runtime
const config = {
  fields: [
    {
      key: 'lockedDate',
      type: 'datepicker',
      label: 'Locked Date',
      value: new Date().toISOString(),
      disabled: true,
    },
  ],
} as const satisfies FormConfig;

export const datepickerDisabledScenario: TestScenario = {
  testId: 'datepicker-disabled',
  title: 'Datepicker - Disabled',
  description: 'Tests disabled datepicker',
  config,
};
