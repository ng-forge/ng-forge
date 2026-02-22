import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'code',
      type: 'input',
      label: 'Code',
      value: '',
      col: 12,
    },
    {
      key: 'nestedStatus',
      type: 'input',
      label: 'Nested Status Field',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'http',
            http: {
              url: '/api/status/nested',
              queryParams: {
                code: 'formValue.code',
              },
            },
            responseExpression: 'response.data.isActive',
            pendingValue: false,
          },
        },
      ],
      col: 12,
    },
    {
      key: 'coercedStatus',
      type: 'input',
      label: 'Coerced Status Field',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'http',
            http: {
              url: '/api/status/coerced',
              queryParams: {
                code: 'formValue.code',
              },
            },
            pendingValue: false,
          },
        },
      ],
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const responseExpressionScenario: TestScenario = {
  testId: 'response-expression-test',
  title: 'Response Expression Patterns',
  description: 'Tests nested responseExpression paths and implicit !!response coercion',
  config,
};
