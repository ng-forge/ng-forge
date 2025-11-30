import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'volume',
      type: 'slider',
      label: 'Volume',
      value: 0,
      minValue: 0,
      maxValue: 100,
    },
  ],
} as const satisfies FormConfig;

export const sliderBasicScenario: TestScenario = {
  testId: 'slider-basic',
  title: 'Slider - Basic',
  description: 'Basic slider functionality',
  config,
};
