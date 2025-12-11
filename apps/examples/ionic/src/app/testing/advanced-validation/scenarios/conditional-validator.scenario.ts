import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    min: 'Value must be at least {{min}}',
  },
  fields: [
    {
      key: 'isAdult',
      type: 'checkbox',
      label: 'I am 18 or older',
      col: 12,
    },
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      props: {
        type: 'number',
      },
      logic: [
        {
          type: 'required',
          condition: {
            type: 'fieldValue',
            operator: 'equals',
            fieldPath: 'isAdult',
            value: true,
          },
        },
      ],
      validators: [
        {
          type: 'min',
          value: 18,
          when: {
            type: 'fieldValue',
            operator: 'equals',
            fieldPath: 'isAdult',
            value: true,
          },
        },
      ],
      validationMessages: {
        min: 'Must be 18 or older',
        required: 'Age is required when you confirm you are 18 or older',
      },
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const conditionalValidatorScenario: TestScenario = {
  testId: 'conditional-validator-test',
  title: 'Conditional Validator Test',
  description: 'Age field is required and must be 18+ only when "I am 18 or older" checkbox is checked',
  config,
};
