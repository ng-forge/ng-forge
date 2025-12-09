import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'lockedDate',
      type: 'datepicker',
      label: 'Locked Date',
      disabled: true,
    },
  ],
} as const satisfies FormConfig;

export const datepickerDisabledScenario: TestScenario = {
  testId: 'datepicker-disabled',
  title: 'Datepicker - Disabled',
  description: 'Disabled datepicker with preset value',
  config,
  initialValue: {
    lockedDate: new Date().toISOString(),
  },
};
