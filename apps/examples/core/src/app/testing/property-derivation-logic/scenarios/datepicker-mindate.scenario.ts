import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'startDate',
      type: 'datepicker',
      label: 'Start Date',
      col: 6,
    },
    {
      key: 'endDate',
      type: 'datepicker',
      label: 'End Date',
      col: 6,
      logic: [
        {
          type: 'propertyDerivation',
          targetProperty: 'minDate',
          expression: 'formValue.startDate',
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: { type: 'submit', color: 'primary' },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

// Use 15th of current month so the endDate calendar opens to the right month
const now = new Date();
const initialStartDate = new Date(now.getFullYear(), now.getMonth(), 15);

export const datepickerMindateScenario: TestScenario = {
  testId: 'datepicker-mindate-test',
  title: 'Datepicker minDate Property Derivation',
  description: 'Tests deriving datepicker minDate from another date field value',
  config,
  initialValue: {
    startDate: initialStartDate,
  },
};
