import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'temperature',
      type: 'slider',
      label: 'Temperature',
      value: 20,
      minValue: 10,
      maxValue: 30,
    },
  ],
} as const satisfies FormConfig;

export const sliderBoundsScenario: TestScenario = {
  testId: 'slider-bounds',
  title: 'Slider - Min/Max Bounds',
  description: 'Tests slider min/max bounds',
  config,
};
