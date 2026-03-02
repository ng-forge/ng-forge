import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const toggleScenario: ExampleScenario = {
  id: 'toggle',
  title: 'Toggle Demo',
  description: 'Demonstrates toggle switch fields.',
  config: {
    fields: [
      {
        key: 'darkMode',
        type: 'toggle',
        label: 'Dark Mode',
      },
      {
        key: 'notifications',
        type: 'toggle',
        label: 'Enable Notifications',
      },
      {
        key: 'autoSave',
        type: 'toggle',
        label: 'Auto-save Changes',
      },
    ],
  } as const satisfies FormConfig,
};
