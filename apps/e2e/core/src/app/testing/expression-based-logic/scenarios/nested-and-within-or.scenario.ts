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
      key: 'hasValidID',
      type: 'checkbox',
      label: 'I have a valid ID',
      col: 12,
    },
    {
      key: 'specialOffer',
      type: 'input',
      label: 'Special Offer Details',
      value: 'You qualify for our special discount program!',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'or',
            conditions: [
              {
                type: 'and',
                conditions: [
                  {
                    type: 'fieldValue',
                    fieldPath: 'isStudent',
                    operator: 'equals',
                    value: true,
                  },
                  {
                    type: 'fieldValue',
                    fieldPath: 'hasValidID',
                    operator: 'equals',
                    value: true,
                  },
                ],
              },
              {
                type: 'and',
                conditions: [
                  {
                    type: 'fieldValue',
                    fieldPath: 'isSenior',
                    operator: 'equals',
                    value: true,
                  },
                  {
                    type: 'fieldValue',
                    fieldPath: 'hasValidID',
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

export const nestedAndWithinOrScenario: TestScenario = {
  testId: 'nested-and-within-or-test',
  title: 'Handle Nested AND within OR Conditions',
  description: 'Tests complex nested AND conditions inside an OR condition',
  config,
};
