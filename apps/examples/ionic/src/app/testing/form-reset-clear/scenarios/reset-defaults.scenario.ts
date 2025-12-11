import { FormConfig, FormResetEvent } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      value: 'John',
      col: 6,
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      value: 'Doe',
      col: 6,
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: 'john.doe@example.com',
      props: {
        type: 'email',
      },
    },
    {
      key: 'reset-button',
      type: 'button',
      label: 'Reset to Defaults',
      event: FormResetEvent,
      props: {
        type: 'button',
      },
    },
  ],
} as const satisfies FormConfig;

export const resetDefaultsScenario: TestScenario = {
  testId: 'reset-defaults',
  title: 'Reset to Default Values',
  description: 'Tests resetting form fields to their default values',
  config,
};
