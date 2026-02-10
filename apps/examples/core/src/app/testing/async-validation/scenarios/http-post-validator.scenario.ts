import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';
import { validateEmail } from '../custom-validators';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      props: {
        type: 'email',
      },
      required: true,
      validators: [
        {
          type: 'customHttp',
          functionName: 'validateEmail',
        },
      ],
      validationMessages: {
        invalidEmail: 'This email address is not valid',
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

export const httpPostValidatorScenario: TestScenario = {
  testId: 'http-post-validator-test',
  title: 'HTTP POST Validator',
  description: 'Validate Email Address using HTTP POST validator',
  config,
  customFnConfig: {
    httpValidators: {
      validateEmail,
    },
  },
};
