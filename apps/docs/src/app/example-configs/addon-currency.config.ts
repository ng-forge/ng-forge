import { FormConfig } from '@ng-forge/dynamic-forms';

export const addonCurrencyConfig = {
  fields: [
    {
      key: 'amount',
      type: 'input',
      label: 'Amount',
      value: '99.00',
      addons: [
        { slot: 'prefix', type: 'text', text: '$' },
        { slot: 'suffix', type: 'text', text: 'USD' },
      ],
    },
  ],
} as const satisfies FormConfig;
