import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'q',
      type: 'input',
      label: 'Search',
      value: 'locked',
      addons: [
        {
          slot: 'suffix',
          kind: 'mat-button',
          icon: 'close',
          ariaLabel: 'Clear',
          preset: 'clear',
          disabled: true,
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const disabledAddonScenario: TestScenario = {
  testId: 'disabled-addon',
  title: 'Addons — disabled mat-button',
  description: 'mat-button addon with `disabled: true` — clear preset still wired but the button is non-interactive.',
  config,
};
