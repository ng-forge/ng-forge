import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'birthDate',
      type: 'datepicker',
      label: 'Date of Birth',
      required: true,
    },
  ],
} as const satisfies FormConfig;

export const datepickerBasicScenario: TestScenario = {
  testId: 'datepicker-basic',
  title: 'Datepicker - Basic',
  description: 'Basic datepicker functionality',
  config,
};
