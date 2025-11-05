/**
 * Registration Wizard - Multi-page registration form
 */
export const registrationWizardConfig = {
  fields: [
    // Page 1: Personal Information
    {
      key: 'personalPage',
      type: 'page',
      props: {
        title: 'Personal Information',
        description: 'Tell us about yourself',
      },
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          required: true,
          defaultValue: 'John',
          validators: [{ type: 'required' }, { type: 'minLength', value: 2 }],
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          required: true,
          defaultValue: 'Smith',
          validators: [{ type: 'required' }, { type: 'minLength', value: 2 }],
          col: 6,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email Address',
          required: true,
          defaultValue: 'john.smith@example.com',
          props: { type: 'email' },
          validators: [{ type: 'required' }, { type: 'email' }],
        },
        {
          key: 'dateOfBirth',
          type: 'input',
          label: 'Date of Birth',
          required: true,
          defaultValue: '1990-05-15',
          props: { type: 'date' },
          validators: [{ type: 'required' }],
          col: 6,
        },
        {
          key: 'gender',
          type: 'select',
          label: 'Gender',
          defaultValue: 'male',
          options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer_not_to_say', label: 'Prefer not to say' },
          ],
          col: 6,
        },
      ],
    },

    // Page 2: Contact Information
    {
      key: 'contactPage',
      type: 'page',
      props: {
        title: 'Contact Information',
        description: 'How can we reach you?',
      },
      fields: [
        {
          key: 'phone',
          type: 'input',
          label: 'Phone Number',
          required: true,
          defaultValue: '+1 (555) 123-4567',
          props: { type: 'tel' },
          validators: [
            { type: 'required' },
            { type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$', errorMessage: 'Please enter a valid phone number' },
          ],
        },
        {
          key: 'address',
          type: 'group',
          label: 'Address',
          fields: [
            {
              key: 'street',
              type: 'input',
              label: 'Street Address',
              required: true,
              defaultValue: '123 Main Street',
              validators: [{ type: 'required' }],
            },
            {
              key: 'city',
              type: 'input',
              label: 'City',
              required: true,
              defaultValue: 'Anytown',
              validators: [{ type: 'required' }],
              col: 6,
            },
            {
              key: 'zipCode',
              type: 'input',
              label: 'ZIP Code',
              required: true,
              defaultValue: '12345',
              validators: [
                { type: 'required' },
                { type: 'pattern', value: '^\\d{5}(-\\d{4})?$', errorMessage: 'Please enter a valid ZIP code' },
              ],
              col: 6,
            },
            {
              key: 'country',
              type: 'select',
              label: 'Country',
              required: true,
              defaultValue: 'us',
              options: [
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'au', label: 'Australia' },
              ],
            },
          ],
        },
      ],
    },

    // Page 3: Preferences
    {
      key: 'preferencesPage',
      type: 'page',
      props: {
        title: 'Preferences',
        description: 'Customize your experience',
      },
      fields: [
        {
          key: 'interests',
          type: 'select',
          label: 'Interests',
          props: { multiple: true },
          defaultValue: ['technology', 'sports'],
          options: [
            { value: 'technology', label: 'Technology' },
            { value: 'sports', label: 'Sports' },
            { value: 'music', label: 'Music' },
            { value: 'travel', label: 'Travel' },
            { value: 'cooking', label: 'Cooking' },
            { value: 'reading', label: 'Reading' },
          ],
        },
        {
          key: 'communicationPreferences',
          type: 'group',
          label: 'Communication Preferences',
          fields: [
            {
              key: 'newsletter',
              type: 'checkbox',
              label: 'Subscribe to newsletter',
              defaultValue: true,
            },
            {
              key: 'smsNotifications',
              type: 'checkbox',
              label: 'Receive SMS notifications',
              defaultValue: false,
            },
            {
              key: 'emailMarketing',
              type: 'checkbox',
              label: 'Receive marketing emails',
              defaultValue: false,
            },
          ],
        },
        {
          key: 'terms',
          type: 'checkbox',
          label: 'I agree to the Terms of Service and Privacy Policy',
          required: true,
          defaultValue: false,
          validators: [{ type: 'required', errorMessage: 'You must agree to the terms' }],
        },
        {
          key: 'submit',
          type: 'submit',
          label: 'Complete Registration',
          color: 'primary',
        },
      ],
    },
  ],
} as const;
