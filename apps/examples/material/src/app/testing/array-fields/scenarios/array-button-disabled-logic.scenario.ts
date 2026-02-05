import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests disabled logic on array buttons.
 * The "Add Item" button should be disabled when the checkbox is checked.
 * The "Remove" button should be disabled when items count is <= 1.
 */
const config = {
  fields: [
    {
      key: 'disableAddButton',
      type: 'checkbox',
      label: 'Disable Add Button',
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
            value: 'First Item',
          },
          {
            key: 'removeButton',
            type: 'removeArrayItem',
            arrayKey: 'items',
            label: 'Remove',
            logic: [
              {
                type: 'disabled',
                condition: {
                  type: 'javascript',
                  expression: 'formValue.items.length <= 1',
                },
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'addItemButton',
      type: 'addArrayItem',
      arrayKey: 'items',
      label: 'Add Item',
      template: [
        { key: 'name', type: 'input', label: 'Item Name' },
        {
          key: 'removeButton',
          type: 'removeArrayItem',
          arrayKey: 'items',
          label: 'Remove',
          logic: [
            {
              type: 'disabled',
              condition: {
                type: 'javascript',
                expression: 'formValue.items.length <= 1',
              },
            },
          ],
        },
      ],
      logic: [
        {
          type: 'disabled',
          condition: {
            type: 'javascript',
            expression: 'formValue.disableAddButton',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const arrayButtonDisabledLogicScenario: TestScenario = {
  testId: 'array-button-disabled-logic',
  title: 'Array Button Disabled Logic',
  description: 'Test disabled logic on array buttons - add button disabled when checkbox is checked, remove disabled when only one item',
  config,
};
