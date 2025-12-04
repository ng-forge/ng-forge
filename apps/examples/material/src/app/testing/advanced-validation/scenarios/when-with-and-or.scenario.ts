import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests built-in validators with complex `when` clauses containing AND/OR logic.
 * This stresses the conditional validator path resolution and ensures
 * composite conditions work correctly with cross-field dependencies.
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    min: 'Value must be at least {{min}}',
  },
  fields: [
    {
      key: 'accountType',
      type: 'select',
      label: 'Account Type',
      options: [
        { label: 'Personal', value: 'personal' },
        { label: 'Business', value: 'business' },
      ],
      value: 'personal',
      col: 6,
    },
    {
      key: 'isVerified',
      type: 'checkbox',
      label: 'Account is verified',
      col: 6,
    },
    {
      key: 'companyName',
      type: 'input',
      label: 'Company Name',
      // Required only when: accountType === 'business' AND isVerified === true
      validators: [
        {
          type: 'required',
          when: {
            type: 'and',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'business',
              },
              {
                type: 'fieldValue',
                fieldPath: 'isVerified',
                operator: 'equals',
                value: true,
              },
            ],
          },
        },
      ],
      validationMessages: {
        required: 'Company name is required for verified business accounts',
      },
      col: 12,
    },
    {
      key: 'isPremium',
      type: 'checkbox',
      label: 'Premium membership',
      col: 6,
    },
    {
      key: 'hasDiscount',
      type: 'checkbox',
      label: 'Has discount code',
      col: 6,
    },
    {
      key: 'paymentMethod',
      type: 'input',
      label: 'Payment Method',
      // Required when: isPremium === true OR hasDiscount === true
      validators: [
        {
          type: 'required',
          when: {
            type: 'or',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'isPremium',
                operator: 'equals',
                value: true,
              },
              {
                type: 'fieldValue',
                fieldPath: 'hasDiscount',
                operator: 'equals',
                value: true,
              },
            ],
          },
        },
      ],
      validationMessages: {
        required: 'Payment method is required for premium or discounted orders',
      },
      col: 12,
    },
    {
      key: 'minOrder',
      type: 'input',
      label: 'Minimum Order Amount',
      props: { type: 'number' },
      value: 50,
      col: 6,
    },
    {
      key: 'orderAmount',
      type: 'input',
      label: 'Order Amount',
      props: { type: 'number' },
      // Min validation applies when: (accountType === 'business') OR (isPremium === true AND isVerified === true)
      validators: [
        {
          type: 'min',
          value: 0,
          expression: 'formValue.minOrder',
          when: {
            type: 'or',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'accountType',
                operator: 'equals',
                value: 'business',
              },
              {
                type: 'and',
                conditions: [
                  {
                    type: 'fieldValue',
                    fieldPath: 'isPremium',
                    operator: 'equals',
                    value: true,
                  },
                  {
                    type: 'fieldValue',
                    fieldPath: 'isVerified',
                    operator: 'equals',
                    value: true,
                  },
                ],
              },
            ],
          },
        },
      ],
      validationMessages: {
        min: 'Order must meet minimum amount for business or verified premium accounts',
      },
      col: 6,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const whenWithAndOrScenario: TestScenario = {
  testId: 'when-with-and-or-test',
  title: 'When Clause with AND/OR Logic',
  description: 'Tests validators with complex when conditions using AND, OR, and nested combinations',
  config,
  initialValue: {
    accountType: 'personal',
    isVerified: false,
    companyName: '',
    isPremium: false,
    hasDiscount: false,
    paymentMethod: '',
    minOrder: 50,
    orderAmount: null,
  },
};
