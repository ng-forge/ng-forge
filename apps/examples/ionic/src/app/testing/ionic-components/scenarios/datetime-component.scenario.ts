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
      props: {
        presentation: 'date',
      },
    },
  ],
} as const satisfies FormConfig;

export const datetimeComponentScenario: TestScenario = {
  testId: 'datetime-component',
  title: 'Datetime - Basic',
  description: 'Tests ion-datetime component for date picking',
  config,
};
