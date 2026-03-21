import { FormConfig } from '@ng-forge/dynamic-forms';

export const checkboxConfig = {
  fields: [
    {
      key: 'newsletter',
      type: 'checkbox',
      label: 'Subscribe to newsletter',
    },
    {
      key: 'terms',
      type: 'checkbox',
      label: 'I agree to the terms and conditions',
      required: true,
      validationMessages: {
        required: 'This field is required',
      },
    },
    {
      key: 'marketing',
      type: 'checkbox',
      label: 'Receive marketing communications',
    },
  ],
} as const satisfies FormConfig;
