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
          kind: 'pi-button',
          icon: 'star',
          ariaLabel: 'Star',
          severity: 'success',
          // `appendStar` is registered via `provideAddonActions({...})` in app.config.ts.
          // Resolved at click time against `ADDON_ACTION_REGISTRY`.
          actionRef: 'appendStar',
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const actionRefScenario: TestScenario = {
  testId: 'action-ref',
  title: 'Addons — actionRef (registered handler)',
  description: 'pi-button addon with a typed `actionRef` resolved against the form-scoped action registry.',
  config,
};
