import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'lockedSlider',
      type: 'slider',
      label: 'Locked Slider',
      value: 50,
      minValue: 0,
      maxValue: 100,
      disabled: true,
    },
  ],
} as const satisfies FormConfig;

export const sliderDisabledScenario: TestScenario = {
  testId: 'slider-disabled',
  title: 'Slider - Disabled',
  description: 'Tests disabled slider',
  config,
};
