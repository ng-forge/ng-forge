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
      defaultValue: 'John',
      col: 6,
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      required: true,
      defaultValue: 'Doe',
      col: 6,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      required: true,
      defaultValue: 'john.doe@example.com',
      props: { type: 'email' },
      validators: [{ type: 'required' }, { type: 'email' }],
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      required: true,
      defaultValue: '30',
      props: { type: 'number', min: 18, max: 100 },
      validators: [{ type: 'required' }, { type: 'min', value: 18 }, { type: 'max', value: 100 }],
      col: 4,
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      defaultValue: 'us',
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
      defaultValue: true,
    },
    {
      key: 'terms',
      type: 'checkbox',
      label: 'I accept the Terms of Service',
      required: true,
      defaultValue: false,
    },
  ],
} as const;
