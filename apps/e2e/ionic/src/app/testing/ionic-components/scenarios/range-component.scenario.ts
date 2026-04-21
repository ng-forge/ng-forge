import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'volume',
      type: 'slider',
      label: 'Volume',
      value: 50,
      // Field-level slider config — adapter components must read these, not just
      // adapter-specific props.min / props.max. See fix(dynamic-forms): wire slider
      // range consistently across adapters.
      minValue: 0,
      maxValue: 100,
      step: 1,
      props: {
        pin: true,
        ticks: true,
        snaps: true,
      },
    },
  ],
} as const satisfies FormConfig;

export const rangeComponentScenario: TestScenario = {
  testId: 'range-component',
  title: 'Range - Basic',
  description: 'Tests ion-range slider with min/max values',
  config,
};
