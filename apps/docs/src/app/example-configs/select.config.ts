import { FormConfig } from '@ng-forge/dynamic-forms';

export const selectConfig = {
  fields: [
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      required: true,
      validationMessages: {
        required: 'This field is required',
      },
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'au', label: 'Australia' },
      ],
      placeholder: 'Select your country',
    },
  ],
} as const satisfies FormConfig;
