import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

// Note: value is computed at runtime
const config = {
  fields: [
    {
      key: 'selectedDate',
      type: 'datepicker',
      label: 'Selected Date',
      value: new Date().toISOString(),
    },
  ],
} as const satisfies FormConfig;

export const datepickerClearScenario: TestScenario = {
  testId: 'datepicker-clear',
  title: 'Datepicker - Clear Value',
  description: 'Tests clearing a datepicker value',
  config,
};
