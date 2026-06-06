import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'q',
      type: 'input',
      label: 'Search',
      value: 'default',
      addons: [
        {
          slot: 'suffix',
          type: 'bs-button',
          icon: 'arrow-counterclockwise',
          ariaLabel: 'Reset',
          preset: 'reset',
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const resetPresetScenario: TestScenario = {
  testId: 'reset-preset',
  title: 'Addons — reset preset',
  description:
    "bs-button with `preset: 'reset'`. Modifying the value then clicking the button restores the field's configured default (`value: 'default'`).",
  config,
};
