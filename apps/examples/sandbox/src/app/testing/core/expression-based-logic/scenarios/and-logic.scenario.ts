import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'hasDiscount',
      type: 'checkbox',
      label: 'I have a discount code',
      col: 6,
    },
    {
      key: 'isPremiumMember',
      type: 'checkbox',
      label: 'I am a premium member',
      col: 6,
    },
    {
      key: 'regularPrice',
      type: 'input',
      label: 'Regular Price Display',
      value: '$99.99',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'and',
            conditions: [
              {
                type: 'fieldValue',
                fieldPath: 'hasDiscount',
                operator: 'equals',
                value: true,
              },
              {
                type: 'fieldValue',
                fieldPath: 'isPremiumMember',
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

export const andLogicScenario: TestScenario = {
  testId: 'and-logic-test',
  title: 'Hide Fields Using AND Conditional Logic',
  description: 'Tests hiding fields when multiple conditions are all true using AND logic',
  config,
};
