import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests simplified array API with an object (multi-field) template.
 * Each item is a group of fields with a remove button appended.
 */
const config = {
  fields: [
    {
      key: 'contacts',
      type: 'array',
      template: [
        { key: 'name', type: 'input', label: 'Contact Name', required: true },
        { key: 'phone', type: 'input', label: 'Phone Number' },
      ],
      value: [
        { name: 'Jane Smith', phone: '555-1234' },
        { name: 'Bob Jones', phone: '555-5678' },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const simplifiedArrayObjectScenario: TestScenario = {
  testId: 'simplified-array-object',
  title: 'Simplified Array - Object',
  description: 'Simplified array API with multi-field template and initial values',
  config,
};
