import { FormConfig } from '@ng-forge/dynamic-form';

/**
 * User Profile Form - Basic cross-field validation
 */
export const userProfileConfig = {
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      required: true,
      value: 'John',
      col: 6,
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      required: true,
      value: 'Doe',
      col: 6,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      required: true,
      value: 'john.doe@example.com',
      props: { type: 'email' },
      validators: [{ type: 'required' }, { type: 'email' }],
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      required: true,
      value: '30',
      props: { type: 'number' },
      min: 18,
      max: 100,
      validators: [{ type: 'required' }, { type: 'min', value: 18 }, { type: 'max', value: 100 }],
      col: 4,
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      value: 'us',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'fr', label: 'France' },
        { value: 'de', label: 'Germany' },
      ],
      col: 8,
    },
    {
      key: 'newsletter',
      type: 'checkbox',
      label: 'Subscribe to Newsletter',
      value: true,
    },
    {
      key: 'terms',
      type: 'checkbox',
      label: 'I accept the Terms of Service',
      required: true,
      value: false,
    },
  ],
} as const satisfies FormConfig;
