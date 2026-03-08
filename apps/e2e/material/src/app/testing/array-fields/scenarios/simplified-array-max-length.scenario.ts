import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests simplified array API with maxLength constraint.
 * Starts with 2 items (at maxLength: 2), form should be valid.
 */
const config = {
  fields: [
    {
      key: 'tags',
      type: 'array',
      template: { key: 'value', type: 'input', label: 'Tag' },
      value: ['angular', 'typescript'],
      maxLength: 2,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const simplifiedArrayMaxLengthScenario: TestScenario = {
  testId: 'simplified-array-max-length',
  title: 'Simplified Array - Max Length',
  description: 'Simplified array API with maxLength constraint',
  config,
};
