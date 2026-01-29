import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'membershipType',
      type: 'select',
      label: 'Membership Type',
      value: 'basic',
      options: [
        { label: 'Basic', value: 'basic' },
        { label: 'Premium', value: 'premium' },
        { label: 'VIP', value: 'vip' },
      ],
      col: 6,
    },
    {
      key: 'discountPercent',
      type: 'input',
      label: 'Discount (%)',
      value: 0,
      props: { type: 'number' },
      readonly: true,
      col: 3,
      logic: [
        {
          type: 'derivation',
          value: 0,
          condition: {
            type: 'fieldValue',
            fieldPath: 'membershipType',
            operator: 'equals',
            value: 'basic',
          },
        },
        {
          type: 'derivation',
          value: 15,
          condition: {
            type: 'fieldValue',
            fieldPath: 'membershipType',
            operator: 'equals',
            value: 'premium',
          },
        },
        {
          type: 'derivation',
          value: 30,
          condition: {
            type: 'fieldValue',
            fieldPath: 'membershipType',
            operator: 'equals',
            value: 'vip',
          },
        },
      ],
    },
    {
      key: 'freeShipping',
      type: 'toggle',
      label: 'Free Shipping',
      value: false,
      disabled: true,
      col: 3,
      logic: [
        {
          type: 'derivation',
          value: false,
          condition: {
            type: 'fieldValue',
            fieldPath: 'membershipType',
            operator: 'equals',
            value: 'basic',
          },
        },
        {
          type: 'derivation',
          value: true,
          condition: {
            type: 'or',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'membershipType',
                operator: 'equals',
                value: 'premium',
              },
              {
                type: 'fieldValue',
                fieldPath: 'membershipType',
                operator: 'equals',
                value: 'vip',
              },
            ],
          },
        },
      ],
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      value: 25,
      props: { type: 'number' },
      col: 4,
    },
    {
      key: 'ageCategory',
      type: 'input',
      label: 'Age Category',
      value: 'Adult',
      readonly: true,
      col: 4,
      logic: [
        {
          type: 'derivation',
          value: 'Minor',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'less',
            value: 18,
          },
        },
        {
          type: 'derivation',
          value: 'Adult',
          condition: {
            type: 'and',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'age',
                operator: 'greaterOrEqual',
                value: 18,
              },
              {
                type: 'fieldValue',
                fieldPath: 'age',
                operator: 'less',
                value: 65,
              },
            ],
          },
        },
        {
          type: 'derivation',
          value: 'Senior',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'greaterOrEqual',
            value: 65,
          },
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: {
        type: 'submit',
        color: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const conditionalDerivationScenario: TestScenario = {
  testId: 'conditional-derivation-test',
  title: 'Conditional Value Derivation',
  description: 'Tests deriving different values based on complex conditions (AND/OR logic)',
  config,
};
