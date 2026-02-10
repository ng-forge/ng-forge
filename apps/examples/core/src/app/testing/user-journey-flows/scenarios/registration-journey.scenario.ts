import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{requiredLength}} characters',
    pattern: 'Invalid format',
  },
  fields: [
    // Page 1: Welcome & Account Type
    {
      key: 'welcomePage',
      type: 'page',
      fields: [
        {
          key: 'welcome-page-title',
          type: 'text',
          label: 'Welcome to Our Platform',
          col: 12,
        },
        {
          key: 'welcome-page-description',
          type: 'text',
          label: "Let's get you started with creating your account",
          col: 12,
        },
        {
          key: 'accountPurpose',
          type: 'radio',
          label: 'What will you use this account for?',
          options: [
            { value: 'personal', label: 'Personal Use' },
            { value: 'business', label: 'Business/Professional' },
            { value: 'education', label: 'Educational Purposes' },
            { value: 'nonprofit', label: 'Non-Profit Organization' },
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
            { value: 'advertisement', label: 'Advertisement' },
            { value: 'other', label: 'Other' },
          ],
          col: 12,
        },
        {
          key: 'nextToPersonalInfoPage',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    // Page 2: Personal Information
    {
      key: 'personalInfoPage',
      type: 'page',
      fields: [
        {
          key: 'personal-info-page-title',
          type: 'text',
          label: 'Personal Information',
          col: 12,
        },
        {
          key: 'personal-info-page-description',
          type: 'text',
          label: 'Please provide your personal details',
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
          key: 'emailAddress',
          type: 'input',
          label: 'Email Address',
          props: {
            type: 'email',
            placeholder: 'Enter your email',
          },
          email: true,
          required: true,
          col: 12,
        },
        {
          key: 'phoneNumber',
          type: 'input',
          label: 'Phone Number',
          props: {
            type: 'tel',
            placeholder: 'Enter your phone number',
          },
          pattern: '^[+]?[0-9\\s\\-\\(\\)]+$',
          col: 6,
        },
        {
          key: 'birthDate',
          type: 'datepicker',
          label: 'Date of Birth',
          required: true,
          col: 6,
        },
        {
          key: 'previousToWelcomePage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToAddressPage',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 3: Address Information
    {
      key: 'addressPage',
      type: 'page',
      fields: [
        {
          key: 'address-page-title',
          type: 'text',
          label: 'Address Information',
          col: 12,
        },
        {
          key: 'address-page-description',
          type: 'text',
          label: 'Where can we reach you?',
          col: 12,
        },
        {
          key: 'streetAddress',
          type: 'input',
          label: 'Street Address',
          props: {
            placeholder: 'Enter your street address',
          },
          required: true,
          col: 12,
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          props: {
            placeholder: 'Enter your city',
          },
          required: true,
          col: 6,
        },
        {
          key: 'state',
          type: 'select',
          label: 'State/Province',
          options: [
            { value: 'ca', label: 'California' },
            { value: 'ny', label: 'New York' },
            { value: 'tx', label: 'Texas' },
            { value: 'fl', label: 'Florida' },
            { value: 'wa', label: 'Washington' },
            { value: 'other', label: 'Other' },
          ],
          required: true,
          col: 6,
        },
        {
          key: 'zipCode',
          type: 'input',
          label: 'ZIP/Postal Code',
          props: {
            placeholder: 'Enter ZIP or postal code',
          },
          pattern: '^[0-9]{5}(-[0-9]{4})?$|^[A-Z][0-9][A-Z]\\s?[0-9][A-Z][0-9]$',
          required: true,
          col: 6,
        },
        {
          key: 'country',
          type: 'select',
          label: 'Country',
          options: [
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'other', label: 'Other' },
          ],
          value: 'us',
          col: 6,
        },
        {
          key: 'previousToPersonalInfoPage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToSecurityPage',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 4: Security & Preferences
    {
      key: 'securityPage',
      type: 'page',
      fields: [
        {
          key: 'security-page-title',
          type: 'text',
          label: 'Security & Preferences',
          col: 12,
        },
        {
          key: 'security-page-description',
          type: 'text',
          label: 'Secure your account and set preferences',
          col: 12,
        },
        {
          key: 'password',
          type: 'input',
          label: 'Password',
          props: {
            type: 'password',
            placeholder: 'Create a strong password',
          },
          required: true,
          minLength: 8,
          col: 6,
        },
        {
          key: 'confirmPassword',
          type: 'input',
          label: 'Confirm Password',
          props: {
            type: 'password',
            placeholder: 'Confirm your password',
          },
          required: true,
          col: 6,
        },
        {
          key: 'securityQuestion',
          type: 'select',
          label: 'Security Question',
          options: [
            { value: 'pet', label: "What was your first pet's name?" },
            { value: 'school', label: 'What was your elementary school?' },
            { value: 'city', label: 'In what city were you born?' },
            { value: 'mother', label: "What is your mother's maiden name?" },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'securityAnswer',
          type: 'input',
          label: 'Security Answer',
          props: {
            placeholder: 'Answer to your security question',
          },
          required: true,
          col: 12,
        },
        {
          key: 'twoFactorAuth',
          type: 'checkbox',
          label: 'Enable two-factor authentication (recommended)',
          col: 12,
        },
        {
          key: 'emailNotifications',
          type: 'checkbox',
          label: 'Receive email notifications',
          col: 6,
        },
        {
          key: 'marketingEmails',
          type: 'checkbox',
          label: 'Receive marketing emails',
          col: 6,
        },
        {
          key: 'previousToAddressPage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToReviewPage',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 5: Review & Submit
    {
      key: 'reviewPage',
      type: 'page',
      fields: [
        {
          key: 'review-page-title',
          type: 'text',
          label: 'Review & Submit',
          col: 12,
        },
        {
          key: 'review-page-description',
          type: 'text',
          label: 'Please review your information and complete registration',
          col: 12,
        },
        {
          key: 'dataAccuracy',
          type: 'checkbox',
          label: 'I confirm that all the information provided is accurate',
          required: true,
          col: 12,
        },
        {
          key: 'termsOfService',
          type: 'checkbox',
          label: 'I agree to the Terms of Service',
          required: true,
          col: 6,
        },
        {
          key: 'privacyPolicy',
          type: 'checkbox',
          label: 'I agree to the Privacy Policy',
          required: true,
          col: 6,
        },
        {
          key: 'previousToSecurityPage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitRegistration',
          type: 'submit',
          label: 'Complete Registration',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const registrationJourneyScenario: TestScenario = {
  testId: 'registration-journey',
  title: 'Complete User Registration Journey',
  description: 'Tests complete user registration flow across 5 pages',
  config,
};
