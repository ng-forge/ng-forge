import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'personal',
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
      ],
    },
    {
      key: 'work',
      type: 'group',
      fields: [
        {
          key: 'company',
          type: 'input',
          label: 'Company',
        },
        {
          key: 'position',
          type: 'input',
          label: 'Position',
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const groupNestedScenario: TestScenario = {
  testId: 'group-nested',
  title: 'Multiple Groups',
  description: 'Verify that multiple groups propagate values correctly',
  config,
  initialValue: {},
};
