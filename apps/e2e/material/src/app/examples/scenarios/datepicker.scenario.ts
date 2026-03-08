import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const datepickerScenario: ExampleScenario = {
  id: 'datepicker',
  title: 'Datepicker Demo',
  description: 'Demonstrates datepicker field with required validation.',
  config: {
    fields: [
      {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Birth Date',
        required: true,
        validationMessages: {
          required: 'This field is required',
        },
        props: {
          placeholder: 'Select your birth date',
        },
      },
    ],
  } as const satisfies FormConfig,
};
