import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'pwd',
      type: 'input',
      label: 'Password',
      props: { type: 'password' },
      addons: [
        {
          slot: 'suffix',
          type: 'bs-button',
          icon: 'eye',
          ariaLabel: 'Toggle password visibility',
          preset: 'toggle-password-visibility',
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const passwordToggleScenario: TestScenario = {
  testId: 'password-toggle',
  title: 'Addons — Password visibility toggle',
  description: 'Bidirectional D-category preset: toggles input type between password and text.',
  config,
};
