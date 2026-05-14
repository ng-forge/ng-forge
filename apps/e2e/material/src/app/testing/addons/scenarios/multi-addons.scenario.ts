import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'amount',
      type: 'input',
      label: 'Amount',
      value: '1234',
      addons: [
        { slot: 'prefix', kind: 'mat-icon', icon: 'attach_money', ariaLabel: 'USD' },
        { slot: 'prefix', kind: 'text', text: '$' },
        { slot: 'suffix', kind: 'text', text: 'USD' },
        { slot: 'suffix', kind: 'mat-button', icon: 'close', ariaLabel: 'Clear', preset: 'clear' },
      ],
    },
  ],
} as const satisfies FormConfig;

export const multiAddonsScenario: TestScenario = {
  testId: 'multi-addons',
  title: 'Addons — multiple slots',
  description: 'Two prefix addons + two suffix addons, mixing icon / text / button kinds. Validates render order preservation.',
  config,
};
