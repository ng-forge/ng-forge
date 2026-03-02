import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests simplified array API with button opt-out.
 * Three arrays on one page: no add button, no remove button, and no buttons at all.
 */
const config = {
  fields: [
    {
      key: 'noAddButton',
      type: 'array',
      template: { key: 'value', type: 'input', label: 'Tag' },
      value: ['featured', 'popular'],
      addButton: false,
    },
    {
      key: 'noRemoveButton',
      type: 'array',
      template: { key: 'value', type: 'input', label: 'Language' },
      value: ['TypeScript'],
      removeButton: false,
    },
    {
      key: 'staticList',
      type: 'array',
      template: { key: 'value', type: 'input', label: 'Item' },
      value: ['A', 'B', 'C'],
      addButton: false,
      removeButton: false,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const simplifiedArrayButtonOptoutScenario: TestScenario = {
  testId: 'simplified-array-button-optout',
  title: 'Simplified Array - Button Opt-out',
  description: 'Simplified array API with addButton: false and removeButton: false',
  config,
};
