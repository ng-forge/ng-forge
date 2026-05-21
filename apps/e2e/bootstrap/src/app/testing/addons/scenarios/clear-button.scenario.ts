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
        { slot: 'prefix', kind: 'bs-icon', icon: 'search', ariaLabel: 'Search' },
        { slot: 'suffix', kind: 'bs-button', icon: 'x', ariaLabel: 'Clear', preset: 'clear' },
      ],
    },
  ],
} as const satisfies FormConfig;

export const clearButtonScenario: TestScenario = {
  testId: 'clear-button',
  title: 'Addons — Clear button',
  description: 'Canonical pattern: bs-icon prefix + bs-button suffix with preset:clear.',
  config,
};
