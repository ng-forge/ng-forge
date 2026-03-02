import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'darkMode',
      type: 'toggle',
      label: 'Dark Mode',
      value: false,
      props: {
        hint: 'Toggle to enable dark mode',
      },
    },
  ],
} as const satisfies FormConfig;

export const toggleLabelScenario: TestScenario = {
  testId: 'toggle-label',
  title: 'Toggle - With Label and Hint',
  description: 'Tests toggle with label and hint text',
  config,
};
