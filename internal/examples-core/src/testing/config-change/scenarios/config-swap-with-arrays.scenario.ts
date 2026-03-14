import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Initial config has a contacts array (name+email per item).
 * Alternate config has an items array (product+quantity per item).
 * Tests that the form correctly handles config swaps involving array fields.
 */

const contactsConfig = {
  fields: [
    {
      key: 'contacts',
      type: 'array',
      fields: [
        [
          {
            key: 'name',
            type: 'input',
            label: 'Contact Name',
            col: 6,
            props: {
              placeholder: 'Enter contact name',
            },
          },
          {
            key: 'email',
            type: 'input',
            label: 'Contact Email',
            col: 6,
            props: {
              type: 'email',
              placeholder: 'Enter contact email',
            },
          },
        ],
      ],
    },
    {
      key: 'addContact',
      type: 'addArrayItem',
      arrayKey: 'contacts',
      label: 'Add Contact',
      template: [
        {
          key: 'name',
          type: 'input',
          label: 'Contact Name',
          col: 6,
          props: {
            placeholder: 'Enter contact name',
          },
        },
        {
          key: 'email',
          type: 'input',
          label: 'Contact Email',
          col: 6,
          props: {
            type: 'email',
            placeholder: 'Enter contact email',
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

const itemsConfig = {
  fields: [
    {
      key: 'items',
      type: 'array',
      fields: [
        [
          {
            key: 'product',
            type: 'input',
            label: 'Product Name',
            col: 6,
            props: {
              placeholder: 'Enter product name',
            },
          },
          {
            key: 'quantity',
            type: 'input',
            label: 'Quantity',
            col: 6,
            props: {
              type: 'number',
              placeholder: 'Enter quantity',
            },
          },
        ],
      ],
    },
    {
      key: 'addItem',
      type: 'addArrayItem',
      arrayKey: 'items',
      label: 'Add Item',
      template: [
        {
          key: 'product',
          type: 'input',
          label: 'Product Name',
          col: 6,
          props: {
            placeholder: 'Enter product name',
          },
        },
        {
          key: 'quantity',
          type: 'input',
          label: 'Quantity',
          col: 6,
          props: {
            type: 'number',
            placeholder: 'Enter quantity',
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

export const configSwapWithArraysConfigVariants = {
  initial: contactsConfig,
  alternate: itemsConfig,
};

export const configSwapWithArraysScenario: TestScenario = {
  testId: 'config-swap-with-arrays',
  title: 'Config Swap with Arrays',
  description: 'Swap configs containing different array fields, verify array transitions work correctly',
  config: contactsConfig,
};
