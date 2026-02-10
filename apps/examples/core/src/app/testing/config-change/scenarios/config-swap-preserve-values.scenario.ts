import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Two configs that share some fields.
 * Initial has firstName/lastName/email, alternate has firstName/email/phone.
 * firstName and email exist in both configs.
 * Tests whether shared field values persist across config transitions.
 */

const initialConfig = {
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
      key: 'submit',
      type: 'submit',
      label: 'Submit',
    },
  ],
} as const satisfies FormConfig;

const alternateConfig = {
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

export const configSwapPreserveValuesConfigVariants = {
  initial: initialConfig,
  alternate: alternateConfig,
};

export const configSwapPreserveValuesScenario: TestScenario = {
  testId: 'config-swap-preserve-values',
  title: 'Config Swap with Value Preservation',
  description: 'Swap configs that share fields, verify shared field values persist',
  config: initialConfig,
};
