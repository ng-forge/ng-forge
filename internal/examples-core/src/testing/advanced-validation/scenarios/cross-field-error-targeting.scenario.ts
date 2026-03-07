import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests cross-field validators that target errors to specific fields.
 * This scenario exercises the code path where validators reference formValue.*
 * and errors must be correctly targeted to the source field.
 *
 * This would have caught the "Cannot resolve path .age" bug where
 * ctx.fieldTreeOf was used incorrectly instead of ctx.field[key].
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    minLength: 'Must be at least {{requiredLength}} characters',
  },
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      props: { type: 'password' },
      required: true,
      minLength: 8,
      col: 6,
    },
    {
      key: 'confirmPassword',
      type: 'input',
      label: 'Confirm Password',
      props: { type: 'password' },
      required: true,
      validators: [
        {
          type: 'custom',
          expression: 'fieldValue === formValue.password',
          kind: 'passwordMatch',
        },
      ],
      validationMessages: {
        passwordMatch: 'Passwords must match',
      },
      col: 6,
    },
    {
      key: 'minAge',
      type: 'input',
      label: 'Minimum Age Requirement',
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
          type: 'custom',
          expression: 'fieldValue >= formValue.minAge',
          kind: 'minAge',
        },
      ],
      validationMessages: {
        minAge: 'Age must be at least the minimum requirement',
      },
      col: 6,
    },
    {
      key: 'minValue',
      type: 'input',
      label: 'Minimum Value',
      props: { type: 'number' },
      value: 10,
      col: 4,
    },
    {
      key: 'maxValue',
      type: 'input',
      label: 'Maximum Value',
      props: { type: 'number' },
      value: 100,
      col: 4,
    },
    {
      key: 'targetValue',
      type: 'input',
      label: 'Target Value (must be in range)',
      props: { type: 'number' },
      required: true,
      validators: [
        {
          type: 'custom',
          expression: 'fieldValue >= formValue.minValue && fieldValue <= formValue.maxValue',
          kind: 'inRange',
        },
      ],
      validationMessages: {
        inRange: 'Value must be between min and max',
      },
      col: 4,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const crossFieldErrorTargetingScenario: TestScenario = {
  testId: 'cross-field-error-targeting-test',
  title: 'Cross-Field Error Targeting',
  description: 'Tests multiple cross-field validators targeting errors to correct fields. Exercises ctx.field[key] path resolution.',
  config,
};
