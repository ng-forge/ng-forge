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
        { slot: 'prefix', kind: 'prime-icon', icon: 'search', ariaLabel: 'Search' },
        { slot: 'suffix', kind: 'prime-button', icon: 'times', ariaLabel: 'Clear', preset: 'clear' },
      ],
    },
  ],
} as const satisfies FormConfig;

export const clearButtonScenario: TestScenario = {
  testId: 'clear-button',
  title: 'Addons — Clear button',
  description: 'Canonical pattern: prime-icon prefix + prime-button suffix with preset:clear.',
  config,
};
