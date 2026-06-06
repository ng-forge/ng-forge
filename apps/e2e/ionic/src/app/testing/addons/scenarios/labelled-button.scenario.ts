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
          type: 'ion-button',
          icon: 'search-outline',
          label: 'Search',
          color: 'primary',
          action: () => {
            /* no-op; visual only */
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const labelledButtonScenario: TestScenario = {
  testId: 'labelled-button',
  title: 'Addons — labelled button with icon',
  description: 'ion-button addon with both `icon` and `label` — validates the Labeled content-axis branch.',
  config,
};
