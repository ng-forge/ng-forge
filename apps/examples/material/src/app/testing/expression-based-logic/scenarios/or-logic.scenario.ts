import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'isStudent',
      type: 'checkbox',
      label: 'I am a student',
      col: 6,
    },
    {
      key: 'isSenior',
      type: 'checkbox',
      label: 'I am a senior (65+)',
      col: 6,
    },
    {
      key: 'discountInfo',
      type: 'input',
      label: 'Discount Information',
      value: 'You qualify for a discount!',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'or',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'isStudent',
                operator: 'equals',
                value: true,
              },
              {
                type: 'fieldValue',
                fieldPath: 'isSenior',
                operator: 'equals',
                value: true,
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

export const orLogicScenario: TestScenario = {
  testId: 'or-logic-test',
  title: 'Apply OR Conditional Logic for Multiple Conditions',
  description: 'Tests hiding fields when at least one condition is true using OR logic',
  config,
};
