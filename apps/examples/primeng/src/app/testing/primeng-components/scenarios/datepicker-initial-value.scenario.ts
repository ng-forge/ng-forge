import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'presetDate',
      type: 'datepicker',
      label: 'Preset Date',
      required: true,
    },
  ],
} as const satisfies FormConfig;

export const datepickerInitialValueScenario: TestScenario = {
  testId: 'datepicker-initial-value',
  title: 'Datepicker - Initial Value',
  description: 'Datepicker with initial value set to January 15, 2024',
  config,
  initialValue: {
    presetDate: new Date(2024, 0, 15).toISOString(),
  },
};
