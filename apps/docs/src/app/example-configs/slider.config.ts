import { FormConfig } from '@ng-forge/dynamic-forms';

export const sliderConfig = {
  fields: [
    {
      key: 'volume',
      type: 'slider',
      label: 'Volume',
      value: 50,
      minValue: 0,
      maxValue: 100,
      step: 5,
    },
  ],
} as const satisfies FormConfig;
