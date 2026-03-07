import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'editMode',
      type: 'checkbox',
      label: 'Enable Edit Mode',
      col: 12,
    },
    {
      key: 'staticReadonly',
      type: 'input',
      label: 'Static Readonly Field',
      value: 'cannot_edit',
      readonly: true,
      col: 12,
    },
    {
      key: 'username',
      type: 'input',
      label: 'Username',
      value: 'existing_user',
      logic: [
        {
          type: 'readonly',
          condition: {
            type: 'javascript',
            expression: '!formValue.editMode',
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

export const readonlyLogicScenario: TestScenario = {
  testId: 'readonly-logic-test',
  title: 'Make Fields Readonly Using Conditional Logic',
  description: 'Tests making fields readonly based on JavaScript expression conditions',
  config,
};
