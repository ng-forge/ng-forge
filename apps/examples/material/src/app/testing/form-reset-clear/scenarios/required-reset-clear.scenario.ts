import { FormClearEvent, FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'requiredField',
      type: 'input',
      label: 'Required Field',
      value: 'Initial Value',
      required: true,
    },
    {
      key: 'reset-button',
      type: 'button',
      label: 'Reset',
      event: FormResetEvent,
      props: {
        type: 'button',
      },
    },
    {
      key: 'clear-button',
      type: 'button',
      label: 'Clear',
      event: FormClearEvent,
      props: {
        type: 'button',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const requiredResetClearScenario: TestScenario = {
  testId: 'required-reset-clear',
  title: 'Required Fields Reset/Clear',
  description: 'Tests reset and clear behavior with required form fields',
  config,
};
