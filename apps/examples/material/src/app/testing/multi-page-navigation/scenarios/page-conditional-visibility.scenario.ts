import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test conditional page visibility.
 * Pages support the 'hidden' logic type through PageLogicConfig.
 * This test verifies that entire pages can be skipped based on field values.
 */
const config = {
  fields: [
    // Page 1: Basic Info
    {
      key: 'basicInfoPage',
      type: 'page',
      fields: [
        {
          key: 'basicInfoTitle',
          type: 'text',
          label: 'Basic Information',
          col: 12,
        },
        {
          key: 'fullName',
          type: 'input',
          label: 'Full Name',
          props: {
            placeholder: 'Enter your full name',
          },
          col: 12,
        },
        {
          key: 'accountType',
          type: 'radio',
          label: 'Account Type',
          options: [
            { value: 'individual', label: 'Individual' },
            { value: 'business', label: 'Business' },
          ],
          value: 'individual',
          col: 12,
        },
        {
          key: 'nextToBusinessPage',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    // Page 2: Business Details (conditional - only for business accounts)
    {
      key: 'businessPage',
      type: 'page',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'notEquals',
            value: 'business',
          },
        },
      ],
      fields: [
        {
          key: 'businessTitle',
          type: 'text',
          label: 'Business Details',
          col: 12,
        },
        {
          key: 'companyName',
          type: 'input',
          label: 'Company Name',
          props: {
            placeholder: 'Enter company name',
          },
          col: 12,
        },
        {
          key: 'taxId',
          type: 'input',
          label: 'Tax ID',
          props: {
            placeholder: 'Enter tax ID',
          },
          col: 6,
        },
        {
          key: 'employeeCount',
          type: 'select',
          label: 'Number of Employees',
          options: [
            { value: '1-10', label: '1-10' },
            { value: '11-50', label: '11-50' },
            { value: '51-200', label: '51-200' },
            { value: '200+', label: '200+' },
          ],
          col: 6,
        },
        {
          key: 'previousToBasicPage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToConfirmationPage',
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
          key: 'confirmationTitle',
          type: 'text',
          label: 'Confirmation',
          col: 12,
        },
        {
          key: 'termsAccepted',
          type: 'checkbox',
          label: 'I accept the terms and conditions',
          col: 12,
        },
        {
          key: 'previousToBusinessOrBasicPage',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitPageConditional',
          type: 'submit',
          label: 'Submit',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const pageConditionalVisibilityScenario: TestScenario = {
  testId: 'page-conditional-visibility',
  title: 'Page Conditional Visibility',
  description: 'Tests conditional page visibility where the Business page only appears for business accounts',
  config,
};
