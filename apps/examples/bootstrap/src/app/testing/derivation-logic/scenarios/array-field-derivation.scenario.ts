import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'invoiceNumber',
      type: 'input',
      label: 'Invoice Number',
      value: 'INV-001',
      col: 12,
    },
    {
      key: 'lineItems',
      type: 'array',
      fields: [
        {
          key: 'itemRow',
          type: 'row',
          fields: [
            {
              key: 'description',
              type: 'input',
              label: 'Description',
              col: 4,
            },
            {
              key: 'quantity',
              type: 'input',
              label: 'Quantity',
              props: { type: 'number' },
              col: 2,
            },
            {
              key: 'unitPrice',
              type: 'input',
              label: 'Unit Price',
              props: { type: 'number' },
              col: 2,
            },
            {
              key: 'lineTotal',
              type: 'input',
              label: 'Line Total',
              readonly: true,
              col: 4,
              // Self-targeting derivation: lineTotal is derived from quantity * unitPrice
              // formValue is scoped to the current array item
              derivation: 'formValue.quantity * formValue.unitPrice',
            },
          ],
        },
      ],
    },
    {
      key: 'addLineItem',
      type: 'addArrayItem',
      arrayKey: 'lineItems',
      label: 'Add Line Item',
      props: { variant: 'primary' },
    },
    {
      key: 'removeLineItem',
      type: 'removeArrayItem',
      arrayKey: 'lineItems',
      label: 'Remove Last Item',
      props: { variant: 'danger' },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: {
        type: 'submit',
        variant: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const arrayFieldDerivationScenario: TestScenario = {
  testId: 'array-field-derivation-test',
  title: 'Array Field Derivation with Relative Paths',
  description: 'Tests derivation within array fields using relative path notation ($.siblingField)',
  config,
  initialValue: {
    invoiceNumber: 'INV-001',
    lineItems: [
      { description: 'Product A', quantity: 2, unitPrice: 50, lineTotal: 100 },
      { description: 'Product B', quantity: 3, unitPrice: 30, lineTotal: 90 },
    ],
  },
};
