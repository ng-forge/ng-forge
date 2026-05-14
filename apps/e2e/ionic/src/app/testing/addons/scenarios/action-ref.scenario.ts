import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'q',
      type: 'input',
      label: 'Search',
      value: '',
      addons: [
        {
          slot: 'suffix',
          kind: 'ion-button',
          icon: 'send-outline',
          ariaLabel: 'Send',
          color: 'primary',
          // `logClick` is registered via `provideAddonActions({...})` in app.config.ts.
          // Resolved at click time against `ADDON_ACTION_REGISTRY`.
          actionRef: 'logClick',
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const actionRefScenario: TestScenario = {
  testId: 'action-ref',
  title: 'Addons — actionRef (registered handler)',
  description: 'ion-button addon with a typed `actionRef` resolved against the form-scoped action registry.',
  config,
};
