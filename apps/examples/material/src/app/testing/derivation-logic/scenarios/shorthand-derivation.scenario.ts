import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'width',
      type: 'input',
      label: 'Width (cm)',
      value: 10,
      props: { type: 'number' },
      col: 4,
    },
    {
      key: 'height',
      type: 'input',
      label: 'Height (cm)',
      value: 5,
      props: { type: 'number' },
      col: 4,
    },
    {
      key: 'area',
      type: 'input',
      label: 'Area (cm²)',
      value: 50,
      props: { type: 'number' },
      readonly: true,
      col: 4,
      // Self-derivation: this field's value is computed from the expression
      derivation: 'formValue.width * formValue.height',
    },
    {
      key: 'price',
      type: 'input',
      label: 'Price',
      value: 100,
      props: { type: 'number' },
      col: 4,
    },
    {
      key: 'quantity',
      type: 'input',
      label: 'Quantity',
      value: 2,
      props: { type: 'number' },
      col: 4,
    },
    {
      key: 'total',
      type: 'input',
      label: 'Total',
      value: 200,
      props: { type: 'number' },
      readonly: true,
      col: 4,
      // Self-derivation: total is computed from price and quantity
      derivation: 'formValue.price * formValue.quantity',
    },
    {
      key: 'hours',
      type: 'input',
      label: 'Hours Worked',
      value: 40,
      props: { type: 'number' },
      col: 4,
    },
    {
      key: 'hourlyRate',
      type: 'input',
      label: 'Hourly Rate ($)',
      value: 25,
      props: { type: 'number' },
      col: 4,
    },
    {
      key: 'salary',
      type: 'input',
      label: 'Weekly Salary ($)',
      value: 1000,
      props: { type: 'number' },
      readonly: true,
      col: 4,
      // Self-derivation: salary is computed from hours and rate
      derivation: 'formValue.hours * formValue.hourlyRate',
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

export const shorthandDerivationScenario: TestScenario = {
  testId: 'shorthand-derivation-test',
  title: 'Shorthand Derivation Property',
  description: 'Tests using the shorthand "derivation" property for self-deriving computed fields',
  config,
};
