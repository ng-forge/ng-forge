import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'presetDate',
      type: 'datepicker',
      label: 'Preset Date',
      value: new Date(2024, 0, 15).toISOString(),
    },
  ],
} as const satisfies FormConfig;

export const datepickerInitialValueScenario: TestScenario = {
  testId: 'datepicker-initial-value',
  title: 'Datepicker - Initial Value',
  description: 'Tests datepicker with initial value',
  config,
};
