import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'presetDate',
      type: 'datepicker',
      label: 'Preset Date',
      value: '2024-12-25',
    },
  ],
} as const satisfies FormConfig;

export const calendarInitialValueScenario: TestScenario = {
  testId: 'calendar-initial-value',
  title: 'Calendar - Initial Value',
  description: 'Tests calendar with initial value',
  config,
};
