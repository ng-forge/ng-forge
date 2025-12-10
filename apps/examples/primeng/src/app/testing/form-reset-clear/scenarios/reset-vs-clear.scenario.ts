import { FormClearEvent, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'name',
      type: 'input',
      label: 'Name',
      value: 'Default Name',
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email (no default)',
      props: {
        type: 'email',
      },
    },
    {
      key: 'reset-button',
      type: 'button',
      label: 'Reset',
      event: FormResetEvent,
      props: {
        type: 'button',
      },
    },
    {
      key: 'clear-button',
      type: 'button',
      label: 'Clear',
      event: FormClearEvent,
      props: {
        type: 'button',
      },
    },
  ],
} as const satisfies FormConfig;

export const resetVsClearScenario: TestScenario = {
  testId: 'reset-vs-clear',
  title: 'Reset vs Clear Behavior',
  description: 'Tests the differences in behavior between reset and clear operations',
  config,
};
