import { FormConfig, NextPageEvent, PreviousPageEvent, SubmitEvent } from '@ng-forge/dynamic-form';

export const registrationConfig = {
  fields: [
    {
      key: 'welcomePage',
      type: 'page',
      fields: [
        {
          key: 'welcomeTitle',
          type: 'text',
          label: 'Welcome',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'welcomeDescription',
          type: 'text',
          label: "Let's get you started",
          col: 12,
        },
        {
          key: 'accountType',
          type: 'radio',
          label: 'Account Type',
          options: [
            { value: 'personal', label: 'Personal Account' },
            { value: 'business', label: 'Business Account' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'referralSource',
          type: 'select',
          label: 'How did you hear about us?',
          options: [
            { value: 'search', label: 'Search Engine' },
            { value: 'social', label: 'Social Media' },
            { value: 'friend', label: 'Friend/Colleague' },
            { value: 'other', label: 'Other' },
          ],
          props: {
            placeholder: 'Select an option',
          },
          col: 12,
        },
        {
          key: 'nextToPersonal',
          type: 'button',
          label: 'Next',
          event: NextPageEvent,
          props: {
            type: 'button',
          },
          col: 12,
        },
      ],
    },
    {
      key: 'personalPage',
      type: 'page',
      fields: [
        {
          key: 'personalTitle',
          type: 'text',
          label: 'Personal Information',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'personalDescription',
          type: 'text',
          label: 'Tell us about yourself',
          col: 12,
        },
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          props: {
            placeholder: 'Enter your first name',
          },
          required: true,
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          props: {
            placeholder: 'Enter your last name',
          },
          required: true,
          col: 6,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email Address',
          props: {
            type: 'email',
            placeholder: 'Enter your email address',
          },
          email: true,
          required: true,
          col: 12,
        },
        {
          key: 'phone',
          type: 'input',
          label: 'Phone Number',
          props: {
            type: 'tel',
            placeholder: 'Enter your phone number',
          },
          col: 12,
        },
        {
          key: 'personal-page-buttons',
          type: 'row',
          fields: [
            {
              key: 'previousToWelcome',
              type: 'button',
              label: 'Previous',
              event: PreviousPageEvent,
              props: {
                type: 'button',
              },
              col: 6,
            },
            {
              key: 'nextToSecurity',
              type: 'button',
              label: 'Next',
              event: NextPageEvent,
              props: {
                type: 'button',
              },
              col: 6,
            },
          ],
        },
      ],
    },
    {
      key: 'securityPage',
      type: 'page',
      fields: [
        {
          key: 'securityTitle',
          type: 'text',
          label: 'Security Settings',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'security-description',
          type: 'text',
          label: 'Secure your account',
          col: 12,
        },
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          props: { type: 'password' },
          required: true,
          minLength: 8,
          col: 6,
        },
        {
          key: 'confirm-password',
          type: 'input',
          label: 'Confirm Password',
          props: { type: 'password' },
          required: true,
          col: 6,
        },
        {
          key: 'security-question',
          type: 'select',
          label: 'Security Question',
          options: [
            { value: 'pet', label: "What was your first pet's name?" },
            { value: 'school', label: 'What was your first school?' },
            { value: 'city', label: 'In what city were you born?' },
          ],
          props: {
            placeholder: 'Choose a security question',
          },
          required: true,
          col: 12,
        },
        {
          key: 'security-answer',
          type: 'input',
          label: 'Security Answer',
          props: {
            placeholder: 'Enter your answer',
          },
          required: true,
          col: 12,
        },
        {
          key: 'security-buttons',
          type: 'row',
          fields: [
            {
              key: 'previousToPersonal',
              type: 'button',
              label: 'Previous',
              event: PreviousPageEvent,
              props: {
                type: 'button',
              },
              col: 6,
            },
            {
              key: 'nextToPreferences',
              type: 'button',
              label: 'Next',
              event: NextPageEvent,
              props: {
                type: 'button',
              },
              col: 6,
            },
          ],
        },
      ],
    },
    {
      key: 'preferencesPage',
      type: 'page',
      fields: [
        {
          key: 'preferencesTitle',
          type: 'text',
          label: 'Preferences',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'preferencesDescription',
          type: 'text',
          label: 'Customize your experience',
          col: 12,
        },
        {
          key: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to newsletter',
          col: 12,
        },
        {
          key: 'notifications',
          type: 'multi-checkbox',
          label: 'Notification Preferences',
          options: [
            { value: 'email', label: 'Email notifications' },
            { value: 'sms', label: 'SMS notifications' },
            { value: 'push', label: 'Push notifications' },
          ],
          col: 12,
        },
        {
          key: 'terms',
          type: 'checkbox',
          label: 'I agree to the Terms of Service',

          required: true,
          col: 12,
        },
        {
          key: 'preferences-buttons',
          type: 'row',
          fields: [
            {
              key: 'previousToSecurity',
              type: 'button',
              label: 'Previous',
              event: PreviousPageEvent,
              props: {
                type: 'button',
              },
              col: 6,
            },
            {
              key: 'submit',
              type: 'button',
              label: 'Complete Registration',
              event: SubmitEvent,
              props: {
                type: 'submit',
              },
              col: 6,
            },
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
