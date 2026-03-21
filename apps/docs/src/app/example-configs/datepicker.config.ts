import { FormConfig } from '@ng-forge/dynamic-forms';

export const datepickerConfig = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'birthDate',
      type: 'datepicker',
      label: 'Birth Date',
      required: true,
      props: {
        placeholder: 'Select your birth date',
      },
    },
  ],
} as const satisfies FormConfig;
