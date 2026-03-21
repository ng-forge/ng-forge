import { FormConfig } from '@ng-forge/dynamic-forms';

export const toggleConfig = {
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
} as const satisfies FormConfig;
