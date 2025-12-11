import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'minValue',
      type: 'input',
      label: 'Minimum Value',
      props: {
        type: 'number',
      },
      required: true,
      col: 6,
    },
    {
      key: 'maxValue',
      type: 'input',
      label: 'Maximum Value',
      props: {
        type: 'number',
      },
      required: true,
      validators: [
        {
          type: 'custom',
          expression: 'fieldValue && formValue.minValue && +fieldValue > +formValue.minValue',
          kind: 'greaterThanMin',
        },
      ],
      col: 6,
      validationMessages: {
        greaterThanMin: 'Maximum must be greater than minimum',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const rangeValidationScenario: TestScenario = {
  testId: 'range-validation-test',
  title: 'Range Validation Test',
  description: 'Maximum value must be greater than minimum value',
  config,
};
