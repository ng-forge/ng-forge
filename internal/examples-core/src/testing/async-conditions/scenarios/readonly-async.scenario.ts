import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { of, delay } from 'rxjs';
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
        { label: 'Viewer', value: 'viewer' },
      ],
      col: 12,
    },
    {
      key: 'salary',
      type: 'input',
      label: 'Salary',
      value: '',
      logic: [
        {
          type: 'readonly',
          condition: {
            type: 'async',
            asyncFunctionName: 'checkReadonly',
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

export const readonlyAsyncScenario: TestScenario = {
  testId: 'readonly-async-test',
  title: 'Readonly via Async',
  description: 'Field readonly/editable based on async condition function',
  config,
  customFnConfig: {
    asyncConditions: {
      checkReadonly: (context: EvaluationContext) => {
        const role = context.formValue.role as string;
        return of(role !== 'admin').pipe(delay(200));
      },
    },
  },
};
