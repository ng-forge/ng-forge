import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Initial config has 2 pages (personal info, contact info).
 * Alternate config has 3 pages (basic info, address, review).
 * Both have submit buttons on the last page.
 * Tests that the form correctly handles config swaps involving multi-page forms.
 */

const twoPageConfig = {
  fields: [
    // Page 1: Personal Info
    {
      key: 'personalInfoPage',
      type: 'page',
      fields: [
        {
          key: 'personalTitle',
          type: 'text',
          label: 'Personal Information',
          col: 12,
        },
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          col: 6,
          props: {
            placeholder: 'Enter first name',
          },
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          col: 6,
          props: {
            placeholder: 'Enter last name',
          },
        },
        {
          key: 'nextToContact',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    // Page 2: Contact Info
    {
      key: 'contactInfoPage',
      type: 'page',
      fields: [
        {
          key: 'contactTitle',
          type: 'text',
          label: 'Contact Information',
          col: 12,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          col: 6,
          props: {
            type: 'email',
            placeholder: 'Enter email',
          },
        },
        {
          key: 'phone',
          type: 'input',
          label: 'Phone',
          col: 6,
          props: {
            type: 'tel',
            placeholder: 'Enter phone number',
          },
        },
        {
          key: 'prevToPersonal',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitTwoPage',
          type: 'submit',
          label: 'Submit',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

const threePageConfig = {
  fields: [
    // Page 1: Basic Info
    {
      key: 'basicInfoPage',
      type: 'page',
      fields: [
        {
          key: 'basicTitle',
          type: 'text',
          label: 'Basic Information',
          col: 12,
        },
        {
          key: 'fullName',
          type: 'input',
          label: 'Full Name',
          col: 12,
          props: {
            placeholder: 'Enter full name',
          },
        },
        {
          key: 'dateOfBirth',
          type: 'datepicker',
          label: 'Date of Birth',
          col: 12,
        },
        {
          key: 'nextToAddress',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    // Page 2: Address
    {
      key: 'addressPage',
      type: 'page',
      fields: [
        {
          key: 'addressTitle',
          type: 'text',
          label: 'Address',
          col: 12,
        },
        {
          key: 'street',
          type: 'input',
          label: 'Street Address',
          col: 12,
          props: {
            placeholder: 'Enter street address',
          },
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          col: 6,
          props: {
            placeholder: 'Enter city',
          },
        },
        {
          key: 'zipCode',
          type: 'input',
          label: 'Zip Code',
          col: 6,
          props: {
            placeholder: 'Enter zip code',
          },
        },
        {
          key: 'prevToBasic',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToReview',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 3: Review
    {
      key: 'reviewPage',
      type: 'page',
      fields: [
        {
          key: 'reviewTitle',
          type: 'text',
          label: 'Review & Submit',
          col: 12,
        },
        {
          key: 'termsAccepted',
          type: 'checkbox',
          label: 'I accept the terms and conditions',
          col: 12,
        },
        {
          key: 'prevToAddress',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitThreePage',
          type: 'submit',
          label: 'Submit',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const configSwapPagesConfigVariants = {
  initial: twoPageConfig,
  alternate: threePageConfig,
};

export const configSwapPagesScenario: TestScenario = {
  testId: 'config-swap-pages',
  title: 'Config Swap with Pages',
  description: 'Swap configs with different multi-page structures, verify page navigation resets correctly',
  config: twoPageConfig,
};
