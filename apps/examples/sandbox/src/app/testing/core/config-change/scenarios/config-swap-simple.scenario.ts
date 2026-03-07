import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Two completely different configs.
 * Initial has firstName/lastName inputs, alternate has email/phone inputs.
 * Tests that the form fully re-renders with new fields when config changes.
 */

const configA = {
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

const configB = {
  fields: [
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

export const configSwapSimpleConfigVariants = {
  initial: configA,
  alternate: configB,
};

export const configSwapSimpleScenario: TestScenario = {
  testId: 'config-swap-simple',
  title: 'Simple Config Swap',
  description: 'Swap entire config, verify form re-renders with new fields',
  config: configA,
};
