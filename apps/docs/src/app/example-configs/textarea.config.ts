import { FormConfig } from '@ng-forge/dynamic-forms';

export const textareaConfig = {
  fields: [
    {
      key: 'bio',
      type: 'textarea',
      label: 'Biography',
      value: '',
      maxLength: 500,
      validationMessages: {
        maxLength: 'Must not exceed {{maxLength}} characters',
      },
      placeholder: 'Tell us about yourself',
      props: {
        rows: 4,
      },
    },
  ],
} as const satisfies FormConfig;
