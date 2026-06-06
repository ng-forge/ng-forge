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
        { slot: 'prefix', type: 'mat-icon', icon: 'attach_money', ariaLabel: 'USD' },
        { slot: 'prefix', type: 'text', text: '$' },
        { slot: 'suffix', type: 'text', text: 'USD' },
        { slot: 'suffix', type: 'mat-button', icon: 'close', ariaLabel: 'Clear', preset: 'clear' },
      ],
    },
  ],
} as const satisfies FormConfig;

export const multiAddonsScenario: TestScenario = {
  testId: 'multi-addons',
  title: 'Addons — multiple slots',
  description: 'Two prefix addons + two suffix addons, mixing icon / text / button types. Validates render order preservation.',
  config,
};
