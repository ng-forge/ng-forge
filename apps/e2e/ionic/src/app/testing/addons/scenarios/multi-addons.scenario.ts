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
        { slot: 'prefix', kind: 'ion-icon', icon: 'cash-outline', ariaLabel: 'USD' },
        { slot: 'prefix', kind: 'text', text: '$' },
        { slot: 'suffix', kind: 'text', text: 'USD' },
        { slot: 'suffix', kind: 'ion-button', icon: 'close-outline', ariaLabel: 'Clear', preset: 'clear' },
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
