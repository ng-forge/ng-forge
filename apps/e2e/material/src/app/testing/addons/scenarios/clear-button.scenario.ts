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
        { slot: 'prefix', kind: 'mat-icon', icon: 'search', ariaLabel: 'Search' },
        { slot: 'suffix', kind: 'mat-button', icon: 'close', ariaLabel: 'Clear', preset: 'clear' },
      ],
    },
  ],
} as const satisfies FormConfig;

export const clearButtonScenario: TestScenario = {
  testId: 'clear-button',
  title: 'Addons — Clear button',
  description: 'Canonical pattern: mat-icon prefix + mat-button suffix with preset:clear.',
  config,
};
