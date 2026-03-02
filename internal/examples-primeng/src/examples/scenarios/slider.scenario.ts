import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const sliderScenario: ExampleScenario = {
  id: 'slider',
  title: 'Slider',
  description: 'Range slider input',
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
