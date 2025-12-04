import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    pattern: 'Invalid phone number format',
  },
  fields: [
    // Page 1: Email Collection
    {
      key: 'emailPage',
      type: 'page',
      fields: [
        {
          key: 'emailPageTitle',
          type: 'text',
          label: 'Email Registration',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'emailPageDescription',
          type: 'text',
          label: 'Please provide your email address',
          col: 12,
        },
        {
          key: 'primaryEmail',
          type: 'input',
          label: 'Primary Email Address',
          props: {
            type: 'email',
            placeholder: 'Enter your primary email',
          },
          email: true,
          required: true,
          col: 12,
        },
        {
          key: 'emailType',
          type: 'radio',
          label: 'Email Type',
          options: [
            { value: 'personal', label: 'Personal Email' },
            { value: 'business', label: 'Business Email' },
            { value: 'other', label: 'Other' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'nextToPage2',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    // Page 2: Personal Information
    {
      key: 'personalPage',
      type: 'page',
      fields: [
        {
          key: 'personalPageTitle',
          type: 'text',
          label: 'Personal Information',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'personalPageDescription',
          type: 'text',
          label: 'Tell us more about yourself',
          col: 12,
        },
        {
          key: 'fullName',
          type: 'input',
          label: 'Full Name',
          props: {
            placeholder: 'Enter your full name',
          },
          required: true,
          col: 12,
        },
        {
          key: 'companyName',
          type: 'input',
          label: 'Company Name',
          props: {
            placeholder: 'Enter company name (for business emails)',
          },
          col: 12,
        },
        {
          key: 'phoneNumber',
          type: 'input',
          label: 'Phone Number',
          props: {
            type: 'tel',
            placeholder: 'Enter phone number',
          },
          pattern: '^[+]?[0-9\\s\\-\\(\\)]+$',
          required: true,
          col: 12,
        },
        {
          key: 'previousToPage1',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToPage3',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 3: Confirmation
    {
      key: 'confirmationPage',
      type: 'page',
      fields: [
        {
          key: 'confirmationPageTitle',
          type: 'text',
          label: 'Confirmation',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'confirmationPageDescription',
          type: 'text',
          label: 'Please confirm your information',
          col: 12,
        },
        {
          key: 'confirmEmail',
          type: 'input',
          label: 'Confirm Email Address',
          props: {
            type: 'email',
            placeholder: 'Re-enter your email to confirm',
          },
          email: true,
          required: true,
          col: 12,
        },
        {
          key: 'termsAgreement',
          type: 'checkbox',
          label: 'I agree to the Terms of Service and Privacy Policy',
          required: true,
          col: 12,
        },
        {
          key: 'emailNotifications',
          type: 'checkbox',
          label: 'Send me email notifications',
          col: 12,
        },
        {
          key: 'previousToPage2',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitEmailVerification',
          type: 'submit',
          label: 'Complete Registration',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const emailVerificationScenario: TestScenario = {
  testId: 'cross-page-email-verification',
  title: 'Cross-Page Email Verification',
  description: 'Tests email collection, personal info, and confirmation across multiple pages',
  config,
};
