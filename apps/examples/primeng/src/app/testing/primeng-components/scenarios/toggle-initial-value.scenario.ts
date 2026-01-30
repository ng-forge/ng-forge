import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'premiumFeatures',
      type: 'toggle',
      label: 'Premium Features Enabled',
      value: true,
    },
  ],
} as const satisfies FormConfig;

export const toggleInitialValueScenario: TestScenario = {
  testId: 'toggle-initial-value',
  title: 'Toggle - Initial Value',
  description: 'Tests toggle with initial value set to true',
  config,
};
