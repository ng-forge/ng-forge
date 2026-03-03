import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { of, delay } from 'rxjs';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'userRole',
      type: 'select',
      label: 'User Role',
      value: '',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Viewer', value: 'viewer' },
      ],
      col: 12,
    },
    {
      key: 'adminPanel',
      type: 'input',
      label: 'Admin Panel Access Code',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'async',
            asyncFunctionName: 'checkAdminHidden',
            pendingValue: true,
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

export const hiddenAsyncScenario: TestScenario = {
  testId: 'hidden-async-test',
  title: 'Hidden via Async',
  description: 'Field hidden/shown based on async condition function',
  config,
  customFnConfig: {
    asyncConditions: {
      checkAdminHidden: (context: EvaluationContext) => {
        const role = context.formValue.userRole as string;
        return of(role !== 'admin').pipe(delay(200));
      },
    },
  },
};
