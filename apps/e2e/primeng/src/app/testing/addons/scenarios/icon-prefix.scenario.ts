import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'q',
      type: 'input',
      label: 'Search',
      placeholder: 'Type to search…',
      addons: [{ slot: 'prefix', type: 'prime-icon', icon: 'search', ariaLabel: 'Search' }],
    },
  ],
} as const satisfies FormConfig;

export const iconPrefixScenario: TestScenario = {
  testId: 'icon-prefix',
  title: 'Addons — Icon prefix',
  description: 'Renders a prime-icon in the input prefix slot.',
  config,
};
