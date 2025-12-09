import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    pattern: 'Invalid format',
  },
  fields: [
    {
      key: 'accountTypePage',
      type: 'page',
      fields: [
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
          key: 'nextToPage2',
          type: 'next',
          label: 'Next',
          col: 12,
        },
      ],
    },
    {
      key: 'businessPage',
      type: 'page',
      fields: [
        {
          key: 'business-information-page',
          type: 'text',
          label: 'Business Information',
        },
        {
          key: 'businessName',
          type: 'input',
          label: 'Business Name',
          props: {
            placeholder: 'Enter business name',
          },
          required: true,
          col: 12,
        },
        {
          key: 'taxId',
          type: 'input',
          label: 'Tax ID / EIN',
          props: {
            placeholder: 'Format: XX-XXXXXXX',
          },
          pattern: '^[0-9]{2}-[0-9]{7}$',
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
    {
      key: 'finalPage',
      type: 'page',
      fields: [
        {
          key: 'final-page-title',
          type: 'text',
          label: 'Final Confirmation',
        },
        {
          key: 'previousToPage2',
          type: 'previous',
          label: 'Previous',
          col: 6,
        },
        {
          key: 'submitBusiness',
          type: 'submit',
          label: 'Create Business Account',
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const businessFlowScenario: TestScenario = {
  testId: 'business-flow',
  title: 'Business Account Flow',
  description: 'Tests business account creation workflow with multiple pages',
  config,
};
