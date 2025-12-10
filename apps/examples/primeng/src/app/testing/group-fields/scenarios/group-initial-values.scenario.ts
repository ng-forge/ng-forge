import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'profile',
      type: 'group',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          props: {
            type: 'email',
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const groupInitialValuesScenario: TestScenario = {
  testId: 'group-initial-values',
  title: 'Group Initial Values',
  description: 'Verify that groups correctly display initial values',
  config,
  initialValue: {
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
  },
};
