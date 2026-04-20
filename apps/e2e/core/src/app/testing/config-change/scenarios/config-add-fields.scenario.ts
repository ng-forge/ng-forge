import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Initial config has firstName/lastName.
 * Extended config has firstName/lastName/email/phone (superset).
 * Tests that adding new fields to a config preserves existing field values.
 */

const initialConfig = {
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      placeholder: 'Enter first name',
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      placeholder: 'Enter last name',
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

const extendedConfig = {
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      placeholder: 'Enter first name',
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      placeholder: 'Enter last name',
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      placeholder: 'Enter email',
      props: {
        type: 'email',
      },
    },
    {
      key: 'phone',
      type: 'input',
      label: 'Phone',
      placeholder: 'Enter phone number',
      props: {
        type: 'tel',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const configAddFieldsConfigVariants = {
  initial: initialConfig,
  extended: extendedConfig,
};

export const configAddFieldsScenario: TestScenario = {
  testId: 'config-add-fields',
  title: 'Add Fields to Config',
  description: 'Switch to a superset config, verify new fields appear and existing values persist',
  config: initialConfig,
};
