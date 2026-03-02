import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'role',
      type: 'select',
      label: 'Role',
      value: '',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
      col: 12,
    },
    {
      key: 'secretField',
      type: 'input',
      label: 'Secret Field',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'http',
            http: {
              url: '/api/multi-logic/visibility',
              queryParams: {
                role: 'formValue.role',
              },
            },
            responseExpression: 'response.shouldHide',
            pendingValue: false,
          },
        },
        {
          type: 'disabled',
          condition: {
            type: 'http',
            http: {
              url: '/api/multi-logic/editability',
              queryParams: {
                role: 'formValue.role',
              },
            },
            responseExpression: 'response.shouldDisable',
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

export const multipleHttpLogicScenario: TestScenario = {
  testId: 'multiple-http-logic-test',
  title: 'Multiple HTTP Logic Types',
  description: 'Verifies multiple independent HTTP conditions (hidden + disabled) on the same field work correctly',
  config,
};
