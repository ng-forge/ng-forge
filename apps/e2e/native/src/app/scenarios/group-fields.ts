import type { FormConfig } from '@ng-forge/dynamic-forms';
import type { TestSuite } from '../types';

export const groupFieldsSuite: TestSuite = {
  id: 'group-fields',
  title: 'Group Fields',
  scenarios: [
    {
      testId: 'group-value-propagation',
      title: 'Group Value Propagation',
      description: 'Values typed in nested group fields propagate to the parent form',
      config: {
        fields: [
          { key: 'name', type: 'input', label: 'Name', placeholder: 'Enter your name' },
          {
            key: 'address',
            type: 'group',
            fields: [
              { key: 'street', type: 'input', label: 'Street', placeholder: 'Enter street address' },
              { key: 'city', type: 'input', label: 'City', placeholder: 'Enter city' },
              { key: 'zip', type: 'input', label: 'ZIP Code', placeholder: 'Enter ZIP' },
            ],
          },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
    {
      testId: 'group-initial-values',
      title: 'Group Initial Values',
      description: 'Groups display initial values',
      config: {
        fields: [
          {
            key: 'profile',
            type: 'group',
            fields: [
              { key: 'firstName', type: 'input', label: 'First Name' },
              { key: 'lastName', type: 'input', label: 'Last Name' },
              { key: 'email', type: 'input', label: 'Email', props: { type: 'email' } },
            ],
          },
        ],
      } as const satisfies FormConfig,
      initialValue: { profile: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' } },
    },
    {
      testId: 'group-nested',
      title: 'Multiple Groups',
      description: 'Multiple groups propagate values independently',
      config: {
        fields: [
          {
            key: 'personal',
            type: 'group',
            fields: [
              { key: 'firstName', type: 'input', label: 'First Name' },
              { key: 'lastName', type: 'input', label: 'Last Name' },
            ],
          },
          {
            key: 'work',
            type: 'group',
            fields: [
              { key: 'company', type: 'input', label: 'Company' },
              { key: 'position', type: 'input', label: 'Position' },
            ],
          },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
  ],
};
