import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests simplified array API with a primitive (single-field) template.
 * Each item is a single input field wrapped in a row with a remove button.
 */
const config = {
  fields: [
    {
      key: 'tags',
      type: 'array',
      template: { key: 'value', type: 'input', label: 'Tag', required: true, minLength: 2 },
      value: ['angular', 'typescript'],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const simplifiedArrayPrimitiveScenario: TestScenario = {
  testId: 'simplified-array-primitive',
  title: 'Simplified Array - Primitive',
  description: 'Simplified array API with single-field template and initial values',
  config,
};
