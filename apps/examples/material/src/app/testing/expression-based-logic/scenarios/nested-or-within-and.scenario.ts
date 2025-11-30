import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'isPaid',
      type: 'checkbox',
      label: 'I have a paid account',
      col: 6,
    },
    {
      key: 'isTrial',
      type: 'checkbox',
      label: 'I am on a trial',
      col: 6,
    },
    {
      key: 'isVerified',
      type: 'checkbox',
      label: 'My account is verified',
      col: 6,
    },
    {
      key: 'isAdmin',
      type: 'checkbox',
      label: 'I am an admin',
      col: 6,
    },
    {
      key: 'premiumFeatures',
      type: 'input',
      label: 'Premium Features',
      value: 'Access to all premium features!',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'and',
            conditions: [
              {
                type: 'or',
                conditions: [
                  {
                    type: 'fieldValue',
                    fieldPath: 'isPaid',
                    operator: 'equals',
                    value: true,
                  },
                  {
                    type: 'fieldValue',
                    fieldPath: 'isTrial',
                    operator: 'equals',
                    value: true,
                  },
                ],
              },
              {
                type: 'or',
                conditions: [
                  {
                    type: 'fieldValue',
                    fieldPath: 'isVerified',
                    operator: 'equals',
                    value: true,
                  },
                  {
                    type: 'fieldValue',
                    fieldPath: 'isAdmin',
                    operator: 'equals',
                    value: true,
                  },
                ],
              },
            ],
          },
        },
      ],
      col: 12,
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

export const nestedOrWithinAndScenario: TestScenario = {
  testId: 'nested-or-within-and-test',
  title: 'Handle Nested OR within AND Conditions',
  description: 'Tests complex nested OR conditions inside an AND condition',
  config,
};
