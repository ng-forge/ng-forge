import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests simplified array API with minLength constraint.
 * Starts with 1 item (violating minLength: 2), form should be invalid.
 */
const config = {
  fields: [
    {
      key: 'tags',
      type: 'array',
      template: { key: 'value', type: 'input', label: 'Tag' },
      value: ['angular'],
      minLength: 2,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const simplifiedArrayMinLengthScenario: TestScenario = {
  testId: 'simplified-array-min-length',
  title: 'Simplified Array - Min Length',
  description: 'Simplified array API with minLength constraint',
  config,
};
