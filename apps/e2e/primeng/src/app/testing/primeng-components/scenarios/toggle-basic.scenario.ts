import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'notifications',
      type: 'toggle',
      label: 'Enable Notifications',
      value: false,
    },
  ],
} as const satisfies FormConfig;

export const toggleBasicScenario: TestScenario = {
  testId: 'toggle-basic',
  title: 'Toggle - Basic',
  description: 'Basic toggle functionality',
  config,
};
