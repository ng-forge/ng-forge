import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'amount',
      type: 'input',
      label: 'Amount',
      props: { type: 'number' },
      addons: [
        { slot: 'prefix', kind: 'text', text: '$' },
        { slot: 'suffix', kind: 'text', text: 'USD' },
      ],
    },
  ],
} as const satisfies FormConfig;

export const textCurrencyScenario: TestScenario = {
  testId: 'text-currency',
  title: 'Addons — Currency text addons',
  description: 'Static text addons in both prefix and suffix slots.',
  config,
};
