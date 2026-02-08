import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test row layout within array items.
 * The "products" array has items with a row containing
 * product name, price, and quantity fields in a horizontal layout.
 */
const config = {
  fields: [
    {
      key: 'products',
      type: 'array',
      fields: [
        [
          {
            key: 'productRow',
            type: 'row',
            fields: [
              {
                key: 'product',
                type: 'input',
                label: 'Product Name',
                col: 4,
                props: { placeholder: 'Enter product name' },
              },
              {
                key: 'price',
                type: 'input',
                label: 'Price',
                col: 4,
                props: { type: 'number', placeholder: 'Enter price' },
              },
              {
                key: 'quantity',
                type: 'input',
                label: 'Quantity',
                col: 4,
                props: { type: 'number', placeholder: 'Enter quantity' },
              },
            ],
          },
        ],
      ],
    },
    {
      key: 'addProduct',
      type: 'addArrayItem',
      arrayKey: 'products',
      label: 'Add Product',
      template: [
        {
          key: 'productRow',
          type: 'row',
          fields: [
            {
              key: 'product',
              type: 'input',
              label: 'Product Name',
              col: 4,
              props: { placeholder: 'Enter product name' },
            },
            {
              key: 'price',
              type: 'input',
              label: 'Price',
              col: 4,
              props: { type: 'number', placeholder: 'Enter price' },
            },
            {
              key: 'quantity',
              type: 'input',
              label: 'Quantity',
              col: 4,
              props: { type: 'number', placeholder: 'Enter quantity' },
            },
          ],
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: { type: 'submit', color: 'primary' },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const rowInsideArrayScenario: TestScenario = {
  testId: 'row-inside-array',
  title: 'Row Inside Array',
  description: 'Verify that row containers render fields horizontally within array items',
  config,
};
