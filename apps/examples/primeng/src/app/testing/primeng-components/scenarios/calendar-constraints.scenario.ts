import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

// Note: minDate and maxDate are computed at runtime to use the current month
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'appointmentDate',
      type: 'datepicker',
      label: 'Appointment Date',
      minDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      maxDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
      required: true,
    },
  ],
} as const satisfies FormConfig;

export const calendarConstraintsScenario: TestScenario = {
  testId: 'calendar-constraints',
  title: 'Calendar - Min/Max Constraints',
  description: 'Tests calendar min/max date constraints',
  config,
};
