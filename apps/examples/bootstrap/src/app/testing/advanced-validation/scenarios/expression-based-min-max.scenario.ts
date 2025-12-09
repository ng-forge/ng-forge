import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests expression-based validator values where min/max validators
 * use dynamic values from other form fields via the "expression" property.
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    min: 'Value must be at least {{min}}',
  },
  fields: [
    {
      key: 'minAge',
      type: 'input',
      label: 'Minimum Age',
      props: { type: 'number' },
      value: 18,
      col: 6,
    },
    {
      key: 'age',
      type: 'input',
      label: 'Your Age',
      props: { type: 'number' },
      required: true,
      validators: [
        {
          type: 'min',
          value: 0,
          expression: 'formValue.minAge',
        },
      ],
      validationMessages: {
        min: 'Age must be at least {{min}}',
      },
      col: 6,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const expressionBasedMinMaxScenario: TestScenario = {
  testId: 'expression-based-min-max-test',
  title: 'Expression-Based Min/Max Validator Values',
  description: 'Tests dynamic validator values where min validator uses expression to read value from another field',
  config,
};
