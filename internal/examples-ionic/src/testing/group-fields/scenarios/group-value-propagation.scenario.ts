import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'name',
      type: 'input',
      label: 'Name',
      props: {
        placeholder: 'Enter your name',
      },
    },
    {
      key: 'address',
      type: 'group',
      fields: [
        {
          key: 'street',
          type: 'input',
          label: 'Street',
          props: {
            placeholder: 'Enter street address',
          },
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          props: {
            placeholder: 'Enter city',
          },
        },
        {
          key: 'zip',
          type: 'input',
          label: 'ZIP Code',
          props: {
            placeholder: 'Enter ZIP',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const groupValuePropagationScenario: TestScenario = {
  testId: 'group-value-propagation',
  title: 'Group Value Propagation',
  description: 'Verify that values typed in nested group fields propagate to the parent form',
  config,
  initialValue: {},
};
