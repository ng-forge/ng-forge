import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';
import { checkProductCode } from '../custom-validators';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'productCode',
      type: 'input',
      label: 'Product Code',
      required: true,
      validators: [
        {
          type: 'customAsync',
          functionName: 'checkProductCode',
        },
      ],
      validationMessages: {
        productCodeTaken: 'This product code is already in use',
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

export const asyncResourceValidatorScenario: TestScenario = {
  testId: 'async-resource-validator-test',
  title: 'Async Resource Validator',
  description: 'Check Product Code Availability using resource-based async validator',
  config,
  customFnConfig: {
    asyncValidators: {
      checkProductCode,
    },
  },
};
