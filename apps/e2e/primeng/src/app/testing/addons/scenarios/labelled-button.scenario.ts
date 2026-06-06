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
          type: 'prime-button',
          icon: 'search',
          label: 'Search',
          severity: 'primary',
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
  description: 'prime-button addon with both `icon` and `label` — validates the Labeled content-axis branch.',
  config,
};
