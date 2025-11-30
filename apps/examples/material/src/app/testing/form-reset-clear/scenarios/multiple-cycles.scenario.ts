import { FormClearEvent, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'field',
      type: 'input',
      label: 'Field',
      value: 'Default',
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

export const multipleCyclesScenario: TestScenario = {
  testId: 'multiple-cycles',
  title: 'Multiple Reset/Clear Cycles',
  description: 'Tests multiple reset and clear cycles',
  config,
};
