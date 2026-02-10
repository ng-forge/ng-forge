import { FormClearEvent, FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'subscribe',
      type: 'checkbox',
      label: 'Subscribe',
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

export const clearCheckboxScenario: TestScenario = {
  testId: 'clear-checkbox',
  title: 'Clear Checkbox Fields',
  description: 'Tests clearing checkbox fields',
  config,
};
