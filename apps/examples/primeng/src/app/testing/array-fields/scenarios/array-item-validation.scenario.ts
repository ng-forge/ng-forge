import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'members',
      type: 'array',
      fields: [
        {
          key: 'memberRow',
          type: 'row',
          fields: [
            {
              key: 'member',
              type: 'group',
              fields: [
                {
                  key: 'name',
                  type: 'input',
                  label: 'Name',
                  required: true,
                },
                {
                  key: 'email',
                  type: 'input',
                  label: 'Email',
                  required: true,
                  email: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: 'addMemberButton',
      type: 'addArrayItem',
      arrayKey: 'members',
      label: 'Add Member',
      className: 'array-add-button',
    },
  ],
} as const satisfies FormConfig;

export const arrayItemValidationScenario: TestScenario = {
  testId: 'array-item-validation',
  title: 'Item Validation',
  description: 'Test validation rules on array item fields',
  config,
  initialValue: {
    members: [{ member: { name: '', email: '' } }], // Start with one empty item (group key preserved)
  },
};
