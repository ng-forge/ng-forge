import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'selectedDate',
      type: 'datepicker',
      label: 'Selected Date',
      required: true,
    },
  ],
} as const satisfies FormConfig;

export const datepickerClearScenario: TestScenario = {
  testId: 'datepicker-clear',
  title: 'Datepicker - Clear',
  description: 'Test clearing datepicker value',
  config,
  initialValue: {
    selectedDate: new Date().toISOString(),
  },
};
