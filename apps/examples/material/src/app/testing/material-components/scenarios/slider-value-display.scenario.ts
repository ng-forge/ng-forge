import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'brightness',
      type: 'slider',
      label: 'Brightness',
      value: 75,
      minValue: 0,
      maxValue: 100,
    },
  ],
} as const satisfies FormConfig;

export const sliderValueDisplayScenario: TestScenario = {
  testId: 'slider-value-display',
  title: 'Slider - Value Display',
  description: 'Tests slider value display',
  config,
};
