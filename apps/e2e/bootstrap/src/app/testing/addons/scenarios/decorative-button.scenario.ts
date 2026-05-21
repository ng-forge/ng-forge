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
          kind: 'bs-button',
          label: 'Info',
          severity: 'info',
          // No preset / actionRef / action — Decorative content-axis branch.
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const decorativeButtonScenario: TestScenario = {
  testId: 'decorative-button',
  title: 'Addons — decorative bs-button',
  description: 'bs-button with no click handler — Decorative content-axis branch. Click is a no-op.',
  config,
};
