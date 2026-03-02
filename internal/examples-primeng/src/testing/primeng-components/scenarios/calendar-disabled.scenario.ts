import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'lockedDate',
      type: 'datepicker',
      label: 'Locked Date',
      value: '2024-06-15',
      disabled: true,
    },
  ],
} as const satisfies FormConfig;

export const calendarDisabledScenario: TestScenario = {
  testId: 'calendar-disabled',
  title: 'Calendar - Disabled',
  description: 'Tests disabled calendar',
  config,
};
