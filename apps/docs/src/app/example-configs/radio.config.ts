import { FormConfig } from '@ng-forge/dynamic-forms';

export const radioConfig = {
  fields: [
    {
      key: 'gender',
      type: 'radio',
      label: 'Gender',
      required: true,
      validationMessages: {
        required: 'This field is required',
      },
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      key: 'contactMethod',
      type: 'radio',
      label: 'Preferred Contact Method',
      options: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'sms', label: 'SMS' },
      ],
    },
  ],
} as const satisfies FormConfig;
