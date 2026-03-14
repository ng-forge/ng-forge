import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests simplified array API with conditional visibility via hidden logic.
 * A checkbox controls whether the array is visible.
 */
const config = {
  fields: [
    {
      key: 'showExtras',
      type: 'checkbox',
      label: 'Show Extras',
      value: false,
    },
    {
      key: 'extras',
      type: 'array',
      template: { key: 'value', type: 'input', label: 'Extra' },
      value: ['bonus'],
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'javascript',
            expression: '!formValue.showExtras',
          },
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const simplifiedArrayConditionalScenario: TestScenario = {
  testId: 'simplified-array-conditional',
  title: 'Simplified Array - Conditional',
  description: 'Simplified array API with conditional visibility via hidden logic',
  config,
};
