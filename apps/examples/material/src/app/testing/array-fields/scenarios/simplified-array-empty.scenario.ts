import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests simplified array API starting with no items.
 * Verifies that the array starts empty and items can be added.
 */
const config = {
  fields: [
    {
      key: 'notes',
      type: 'array',
      template: { key: 'text', type: 'input', label: 'Note', props: { placeholder: 'Enter a note' } },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const simplifiedArrayEmptyScenario: TestScenario = {
  testId: 'simplified-array-empty',
  title: 'Simplified Array - Empty',
  description: 'Simplified array API starting with no items',
  config,
};
