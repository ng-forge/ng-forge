import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const sliderScenario: ExampleScenario = {
  id: 'slider',
  title: 'Slider Demo',
  description: 'Demonstrates slider field with min, max, and step configuration.',
  config: {
    fields: [
      {
        key: 'volume',
        type: 'slider',
        label: 'Notification Volume',
        minValue: 0,
        maxValue: 100,
        step: 10,
        value: 50,
      },
    ],
  } as const satisfies FormConfig,
};
