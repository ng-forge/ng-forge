import { FormConfig } from '@ng-forge/dynamic-form';

export const confirmationConfig = {
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Review & Confirmation',
      props: {
        elementType: 'h2',
      },
      col: 12,
    },
    {
      key: 'description',
      type: 'text',
      label: 'Please review your information and accept our terms to complete registration.',
      col: 12,
    },
    {
      key: 'summary',
      type: 'group',
      label: 'Registration Summary',
      fields: [
        {
          key: 'summaryText',
          type: 'text',
          label: 'Your account will be created with the information you provided. You will receive a confirmation email shortly.',
          className: 'summary-text',
          col: 12,
        },
        {
          key: 'emailVerification',
          type: 'text',
          label: 'Email verification required: We will send a verification link to your email address.',
          className: 'verification-note',
          col: 12,
        },
      ],
      col: 12,
    },
    {
      key: 'agreements',
      type: 'group',
      label: 'Terms & Agreements',
      fields: [
        {
          key: 'termsOfService',
          type: 'checkbox',
          label: 'I agree to the Terms of Service and Privacy Policy',
          props: {
            color: 'primary',
          },
          required: true,
          col: 12,
        },
        {
          key: 'ageVerification',
          type: 'checkbox',
          label: 'I confirm that I am at least 18 years old',
          props: {
            color: 'primary',
          },
          required: true,
          col: 12,
        },
        {
          key: 'marketingConsent',
          type: 'checkbox',
          label: 'I consent to receive marketing communications (optional)',
          props: {
            color: 'primary',
          },
          col: 12,
        },
        {
          key: 'dataProcessing',
          type: 'checkbox',
          label: 'I consent to the processing of my personal data as described in the Privacy Policy',
          props: {
            color: 'primary',
          },
          required: true,
          col: 12,
        },
      ],
      col: 12,
    },
    {
      key: 'verification',
      type: 'group',
      label: 'Identity Verification',
      fields: [
        {
          key: 'captcha',
          type: 'text',
          label: 'Complete CAPTCHA verification (simulated)',
          className: 'captcha-placeholder',
          col: 12,
        },
        {
          key: 'humanVerification',
          type: 'checkbox',
          label: 'I am not a robot',
          props: {
            color: 'primary',
          },
          required: true,
          col: 12,
        },
      ],
      col: 12,
    },
    {
      key: 'actions',
      type: 'row',
      fields: [
        {
          key: 'goBack',
          type: 'button',
          label: 'Go Back',
          props: {
            type: 'button',
            color: 'accent',
          },
          col: 6,
        },
        {
          key: 'completeRegistration',
          type: 'button',
          label: 'Complete Registration',
          props: {
            type: 'submit',
            color: 'primary',
          },
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;
