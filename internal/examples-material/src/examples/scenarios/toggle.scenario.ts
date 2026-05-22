import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const toggleScenario: ExampleScenario = {
  id: 'toggle',
  title: 'Toggle Demo',
  description: 'Demonstrates toggle switch fields, including a nullable checkbox variant (issue #415).',
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
      {
        key: 'newsletterOptIn',
        type: 'checkbox',
        label: 'Newsletter (undecided — model permits null)',
        value: null,
        nullable: true,
      },
    ],
  } as const satisfies FormConfig,
};
