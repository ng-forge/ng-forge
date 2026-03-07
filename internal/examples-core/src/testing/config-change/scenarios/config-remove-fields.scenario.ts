import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Initial config has firstName/lastName/email/phone.
 * Reduced config has firstName/lastName only.
 * Tests that removing fields from a config removes them from the form
 * while preserving remaining field values.
 */

const fullConfig = {
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      props: {
        placeholder: 'Enter first name',
      },
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      props: {
        placeholder: 'Enter last name',
      },
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      props: {
        type: 'email',
        placeholder: 'Enter email',
      },
    },
    {
      key: 'phone',
      type: 'input',
      label: 'Phone',
      props: {
        type: 'tel',
        placeholder: 'Enter phone number',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

const reducedConfig = {
  fields: [
    {
      key: 'firstName',
      type: 'input',
      label: 'First Name',
      props: {
        placeholder: 'Enter first name',
      },
    },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last Name',
      props: {
        placeholder: 'Enter last name',
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

export const configRemoveFieldsConfigVariants = {
  initial: fullConfig,
  reduced: reducedConfig,
};

export const configRemoveFieldsScenario: TestScenario = {
  testId: 'config-remove-fields',
  title: 'Remove Fields from Config',
  description: 'Switch to a subset config, verify removed fields disappear and remaining values persist',
  config: fullConfig,
};
