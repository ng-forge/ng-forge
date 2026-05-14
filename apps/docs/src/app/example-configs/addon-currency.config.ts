import { FormConfig } from '@ng-forge/dynamic-forms';

export const addonCurrencyConfig = {
  fields: [
    {
      key: 'amount',
      type: 'input',
      label: 'Amount',
      value: '99.00',
      addons: [
        { slot: 'prefix', kind: 'text', text: '$' },
        { slot: 'suffix', kind: 'text', text: 'USD' },
      ],
    },
  ],
} as const satisfies FormConfig;
