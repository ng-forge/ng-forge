import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'quantity',
      type: 'input',
      label: 'Quantity',
      value: 1,
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
      label: 'Unit Price',
      value: 10,
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
      key: 'subtotal',
      type: 'input',
      label: 'Subtotal',
      value: 10,
      props: { type: 'number' },
      readonly: true,
      col: 4,
    },
    {
      key: 'tax',
      type: 'input',
      label: 'Tax',
      value: 1,
      props: { type: 'number' },
      readonly: true,
      col: 4,
    },
    {
      key: 'total',
      type: 'input',
      label: 'Total',
      value: 11,
      props: { type: 'number' },
      readonly: true,
      col: 4,
    },
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      value: '',
      col: 4,
      logic: [
        {
          type: 'derivation',
          targetField: 'fullName',
          expression: 'formValue.firstName + " " + formValue.lastName',
        },
      ],
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      value: '',
      col: 4,
      logic: [
        {
          type: 'derivation',
          targetField: 'fullName',
          expression: 'formValue.firstName + " " + formValue.lastName',
        },
      ],
    },
    {
      key: 'fullName',
      type: 'input',
      label: 'Full Name',
      value: ' ',
      readonly: true,
      col: 4,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: {
        type: 'submit',
        color: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const expressionDerivationScenario: TestScenario = {
  testId: 'expression-derivation-test',
  title: 'Expression-Based Derivation',
  description: 'Tests deriving values using JavaScript expressions (calculations and string concatenation)',
  config,
};
