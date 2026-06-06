import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'q',
      type: 'input',
      label: 'Search',
      value: 'initial value',
      addons: [
        { slot: 'prefix', type: 'ion-icon', icon: 'search-outline', ariaLabel: 'Search' },
        { slot: 'suffix', type: 'ion-button', icon: 'close-outline', ariaLabel: 'Clear', preset: 'clear' },
      ],
    },
  ],
} as const satisfies FormConfig;

export const clearButtonScenario: TestScenario = {
  testId: 'clear-button',
  title: 'Addons — Clear button',
  description: 'Canonical pattern: ion-icon prefix + ion-button suffix with preset:clear.',
  config,
};
