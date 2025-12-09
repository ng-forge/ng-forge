import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'eventDate',
      type: 'datepicker',
      label: 'Event Date',
      required: true,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const datepickerValidationScenario: TestScenario = {
  testId: 'datepicker-validation',
  title: 'Datepicker - Validation',
  description: 'Test datepicker required validation on submit',
  config,
};
