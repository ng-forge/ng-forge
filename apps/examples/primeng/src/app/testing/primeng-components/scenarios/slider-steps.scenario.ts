import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'rating',
      type: 'slider',
      label: 'Rating',
      value: 0,
      minValue: 0,
      maxValue: 10,
      step: 1,
    },
  ],
} as const satisfies FormConfig;

export const sliderStepsScenario: TestScenario = {
  testId: 'slider-steps',
  title: 'Slider - Step Increments',
  description: 'Tests slider step increments',
  config,
};
