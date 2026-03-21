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
      props: {
        rows: 4,
        placeholder: 'Tell us about yourself',
      },
    },
  ],
} as const satisfies FormConfig;
