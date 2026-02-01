import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'volume',
      type: 'slider',
      label: 'Volume',
      value: 50,
      props: {
        min: 0,
        max: 100,
        step: 1,
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
