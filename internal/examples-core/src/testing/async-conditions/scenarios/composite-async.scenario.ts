import { FormConfig, EvaluationContext } from '@ng-forge/dynamic-forms';
import { of, delay } from 'rxjs';
import { TestScenario } from '../../shared/types';

/**
 * Tests multiple independent logic entries on the same field:
 * one async condition (hidden) and one fieldValue condition (disabled).
 * Each condition type is resolved independently — async via the signal-based
 * factory, fieldValue synchronously.
 */
const config = {
  fields: [
    {
      key: 'userRole',
      type: 'select',
      label: 'User Role',
      value: '',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
      col: 6,
    },
    {
      key: 'featureFlag',
      type: 'toggle',
      label: 'Enable Editing',
      value: true,
      col: 6,
    },
    {
      key: 'advancedPanel',
      type: 'input',
      label: 'Advanced Panel',
      value: '',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'async',
            asyncFunctionName: 'checkRoleHidden',
            pendingValue: true,
          },
        },
        {
          type: 'disabled',
          condition: {
            type: 'fieldValue',
            fieldPath: 'featureFlag',
            operator: 'equals',
            value: false,
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

export const compositeAsyncScenario: TestScenario = {
  testId: 'composite-async-test',
  title: 'Multiple Logic Types with Async',
  description: 'Tests independent async hidden + sync disabled conditions on the same field',
  config,
  customFnConfig: {
    asyncConditions: {
      checkRoleHidden: (context: EvaluationContext) => {
        const role = context.formValue.userRole as string;
        // viewer → hide (true), admin/editor → show (false)
        return of(role === 'viewer').pipe(delay(200));
      },
    },
  },
};
