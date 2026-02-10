import { FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'subscribe',
      type: 'checkbox',
      label: 'Subscribe to newsletter',
      value: true,
    },
    {
      key: 'terms',
      type: 'checkbox',
      label: 'Accept terms',
      value: false,
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
  ],
} as const satisfies FormConfig;

export const resetCheckboxScenario: TestScenario = {
  testId: 'reset-checkbox',
  title: 'Reset Checkbox Fields',
  description: 'Tests resetting checkbox fields to their default values',
  config,
};
