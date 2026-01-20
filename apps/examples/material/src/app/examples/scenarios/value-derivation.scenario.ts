import { FormConfig } from '@ng-forge/dynamic-forms';
import { ExampleScenario } from '../shared/types';

export const valueDerivationScenario: ExampleScenario = {
  id: 'value-derivation',
  title: 'Value Derivation',
  description: 'Demonstrates automatic value derivation using expressions to calculate totals and concatenate strings.',
  config: {
    fields: [
      {
        key: 'calculationTitle',
        type: 'text',
        label: 'Order Calculator',
        props: { elementType: 'h3' },
      },
      {
        key: 'quantity',
        type: 'input',
        label: 'Quantity',
        value: 1,
        min: 1,
        props: { type: 'number' },
        col: 4,
        logic: [
          {
            type: 'derivation',
            targetField: 'subtotal',
            expression: 'formValue.quantity * formValue.unitPrice',
          },
          {
            type: 'derivation',
            targetField: 'tax',
            expression: 'formValue.subtotal * formValue.taxRate / 100',
          },
          {
            type: 'derivation',
            targetField: 'total',
            expression: 'formValue.subtotal + formValue.tax',
          },
        ],
      },
      {
        key: 'unitPrice',
        type: 'input',
        label: 'Unit Price ($)',
        value: 25,
        props: { type: 'number' },
        col: 4,
        logic: [
          {
            type: 'derivation',
            targetField: 'subtotal',
            expression: 'formValue.quantity * formValue.unitPrice',
          },
          {
            type: 'derivation',
            targetField: 'tax',
            expression: 'formValue.subtotal * formValue.taxRate / 100',
          },
          {
            type: 'derivation',
            targetField: 'total',
            expression: 'formValue.subtotal + formValue.tax',
          },
        ],
      },
      {
        key: 'subtotal',
        type: 'input',
        label: 'Subtotal ($)',
        value: 25,
        props: { type: 'number' },
        readonly: true,
        col: 4,
      },
      {
        key: 'taxRate',
        type: 'input',
        label: 'Tax Rate (%)',
        value: 10,
        props: { type: 'number' },
        col: 4,
        logic: [
          {
            type: 'derivation',
            targetField: 'tax',
            expression: 'formValue.subtotal * formValue.taxRate / 100',
          },
          {
            type: 'derivation',
            targetField: 'total',
            expression: 'formValue.subtotal + formValue.tax',
          },
        ],
      },
      {
        key: 'tax',
        type: 'input',
        label: 'Tax ($)',
        value: 2.5,
        props: { type: 'number' },
        readonly: true,
        col: 4,
      },
      {
        key: 'total',
        type: 'input',
        label: 'Total ($)',
        value: 27.5,
        props: { type: 'number' },
        readonly: true,
        col: 4,
      },
      {
        key: 'nameTitle',
        type: 'text',
        label: 'Name Concatenation',
        props: { elementType: 'h3' },
      },
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        value: 'John',
        col: 4,
        logic: [
          {
            type: 'derivation',
            targetField: 'fullName',
            expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")',
          },
        ],
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        value: 'Doe',
        col: 4,
        logic: [
          {
            type: 'derivation',
            targetField: 'fullName',
            expression: '(formValue.firstName || "") + " " + (formValue.lastName || "")',
          },
        ],
      },
      {
        key: 'fullName',
        type: 'input',
        label: 'Full Name',
        value: 'John Doe',
        readonly: true,
        col: 4,
      },
    ],
  } as const satisfies FormConfig,
};
