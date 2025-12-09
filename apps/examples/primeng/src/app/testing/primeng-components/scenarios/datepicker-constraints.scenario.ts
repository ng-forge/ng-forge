import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'appointmentDate',
      type: 'datepicker',
      label: 'Appointment Date',
      required: true,
      minDate: firstDayOfMonth,
      maxDate: lastDayOfMonth,
    },
  ],
} as const satisfies FormConfig;

export const datepickerConstraintsScenario: TestScenario = {
  testId: 'datepicker-constraints',
  title: 'Datepicker - Constraints',
  description: 'Datepicker with min/max date constraints (current month)',
  config,
};
