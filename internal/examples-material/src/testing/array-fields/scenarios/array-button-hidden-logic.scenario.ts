import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests hidden logic on array buttons.
 * The "Add Item" button should be hidden when the checkbox is checked.
 */
const config = {
  fields: [
    {
      key: 'hideAddButton',
      type: 'checkbox',
      label: 'Hide Add Button',
      value: false,
    },
    {
      key: 'items',
      type: 'array',
      fields: [
        [
          {
            key: 'name',
            type: 'input',
            label: 'Item Name',
          },
        ],
      ],
    },
    {
      key: 'addItemButton',
      type: 'addArrayItem',
      arrayKey: 'items',
      label: 'Add Item',
      template: [{ key: 'name', type: 'input', label: 'Item Name' }],
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'javascript',
            expression: 'formValue.hideAddButton',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const arrayButtonHiddenLogicScenario: TestScenario = {
  testId: 'array-button-hidden-logic',
  title: 'Array Button Hidden Logic',
  description: 'Test hidden logic on array buttons - button hides when checkbox is checked',
  config,
};
