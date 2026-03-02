import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'includeAddress',
      type: 'checkbox',
      label: 'Include Address',
      value: true,
    },
    {
      key: 'name',
      type: 'input',
      label: 'Name',
      value: 'Test User',
      props: { placeholder: 'Enter name' },
    },
    {
      key: 'addressGroup',
      type: 'group',
      fields: [
        {
          key: 'street',
          type: 'input',
          label: 'Street',
          value: '456 Oak Ave',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'includeAddress',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: { placeholder: 'Enter street' },
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          value: 'Portland',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'includeAddress',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: { placeholder: 'Enter city' },
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: { type: 'submit', color: 'primary' },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const submitConditionalContainersScenario: TestScenario = {
  testId: 'submit-conditional-containers',
  title: 'Submit with Conditional Containers',
  description: 'Verify submission behavior when containers have conditional visibility',
  config,
};
