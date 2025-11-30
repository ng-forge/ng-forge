import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'darkMode',
      type: 'toggle',
      label: 'Dark Mode',
      value: false,
    },
  ],
} as const satisfies FormConfig;

export const toggleKeyboardScenario: TestScenario = {
  testId: 'toggle-keyboard',
  title: 'Toggle - Keyboard Support',
  description: 'Tests toggle keyboard support',
  config,
};
