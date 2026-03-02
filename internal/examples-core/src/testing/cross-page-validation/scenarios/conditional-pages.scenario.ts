import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    pattern: 'Invalid format',
  },
  fields: [
    // Page 1: Account Type Selection
    {
      key: 'accountTypePage',
      type: 'page',

      fields: [
        {
          key: 'account-type-description',
          type: 'text',
          label: 'Select your account type',
        },
        {
          key: 'accountType',
          type: 'radio',
          label: 'Account Type',
          options: [
            { value: 'individual', label: 'Individual Account' },
            { value: 'business', label: 'Business Account' },
            { value: 'nonprofit', label: 'Non-Profit Organization' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'primaryUse',
          type: 'select',
          label: 'Primary Use',
          options: [
            { value: 'personal', label: 'Personal Use' },
            { value: 'professional', label: 'Professional Use' },
            { value: 'education', label: 'Educational Use' },
            { value: 'charity', label: 'Charitable Work' },
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
    // Page 2: Individual Information
    {
      key: 'individualPage',
      type: 'page',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'accountType',
            operator: 'notEquals',
            value: 'individual',
          },
        },
      ],
      fields: [
        {
          key: 'individual-description',
          type: 'text',
          label: 'Personal account details',
        },
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          props: {
            placeholder: 'Enter first name',
          },
          validators: [
            {
              type: 'required',
              when: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'individual',
              },
            },
          ],
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          props: {
            placeholder: 'Enter last name',
          },
          validators: [
            {
              type: 'required',
              when: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'individual',
              },
            },
          ],
          col: 6,
        },
        {
          key: 'birthDate',
          type: 'datepicker',
          label: 'Date of Birth',
          validators: [
            {
              type: 'required',
              when: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'individual',
              },
            },
          ],
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
    // Page 3: Business Information
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
          key: 'business-page-description',
          type: 'text',
          label: 'Business account details',
        },
        {
          key: 'businessName',
          type: 'input',
          label: 'Business Name',
          props: {
            placeholder: 'Enter business name',
          },
          validators: [
            {
              type: 'required',
              when: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'business',
              },
            },
          ],
          col: 12,
        },
        {
          key: 'taxId',
          type: 'input',
          label: 'Tax ID / EIN',
          props: {
            placeholder: 'Enter tax identification number',
          },
          validators: [
            {
              type: 'required',
              when: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'business',
              },
            },
            {
              type: 'pattern',
              value: '^[0-9]{2}-[0-9]{7}$',
              when: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'business',
              },
            },
          ],
          col: 6,
        },
        {
          key: 'businessType',
          type: 'select',
          label: 'Business Type',
          options: [
            { value: 'llc', label: 'LLC' },
            { value: 'corporation', label: 'Corporation' },
            { value: 'partnership', label: 'Partnership' },
            { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
          ],
          validators: [
            {
              type: 'required',
              when: {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'business',
              },
            },
          ],
          col: 6,
        },
        {
          key: 'previousToPage2',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'nextToPage4',
          type: 'next',
          label: 'Next',
          col: 6,
        },
      ],
    },
    // Page 4: Final Confirmation
    {
      key: 'finalPage',
      type: 'page',
      fields: [
        {
          key: 'final-page-description',
          type: 'text',
          label: 'Review and submit your information',
        },
        {
          key: 'confirmationCode',
          type: 'input',
          label: 'Confirmation Code',
          props: {
            placeholder: 'Enter confirmation code (sent via email)',
          },
          pattern: '^[A-Z0-9]{6}$',
          required: true,
          col: 12,
        },
        {
          key: 'finalTerms',
          type: 'checkbox',
          label: 'I confirm all information is accurate',
          required: true,
          col: 12,
        },
        {
          key: 'previousToPage3',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitConditional',
          type: 'submit',
          label: 'Create Account',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const conditionalPagesScenario: TestScenario = {
  testId: 'conditional-pages',
  title: 'Conditional Page Visibility',
  description: 'Tests showing/hiding pages based on account type selection',
  config,
};
