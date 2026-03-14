import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'notifications',
      type: 'toggle',
      label: 'Enable Notifications',
      value: false,
      props: {
        color: 'primary',
        labelPlacement: 'start',
      },
    },
  ],
} as const satisfies FormConfig;

export const toggleComponentScenario: TestScenario = {
  testId: 'toggle-component',
  title: 'Toggle - Basic',
  description: 'Tests ion-toggle state and label',
  config,
};
