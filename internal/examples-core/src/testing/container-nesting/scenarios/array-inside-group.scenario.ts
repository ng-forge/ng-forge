import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test array fields nested inside a group container via a row.
 * The group "team" contains a "teamName" input and a row wrapping
 * a "members" array. Each member has name and role inputs.
 *
 * Note: Groups cannot directly contain arrays per type constraints
 * (GroupAllowedChildren = LeafFieldTypes | RowField), so the array
 * is wrapped in a row (RowAllowedChildren includes ArrayField).
 */
const config = {
  fields: [
    {
      key: 'team',
      type: 'group',
      fields: [
        {
          key: 'teamName',
          type: 'input',
          label: 'Team Name',
          props: { placeholder: 'Enter team name' },
        },
        {
          key: 'membersRow',
          type: 'row',
          fields: [
            {
              key: 'members',
              type: 'array',
              col: 12,
              fields: [
                [
                  {
                    key: 'name',
                    type: 'input',
                    label: 'Member Name',
                    col: 6,
                    props: { placeholder: 'Enter member name' },
                  },
                  {
                    key: 'role',
                    type: 'input',
                    label: 'Role',
                    col: 6,
                    props: { placeholder: 'Enter role' },
                  },
                ],
              ],
            },
          ],
        },
        {
          key: 'addMember',
          type: 'addArrayItem',
          arrayKey: 'members',
          label: 'Add Member',
          template: [
            {
              key: 'name',
              type: 'input',
              label: 'Member Name',
              col: 6,
              props: { placeholder: 'Enter member name' },
            },
            {
              key: 'role',
              type: 'input',
              label: 'Role',
              col: 6,
              props: { placeholder: 'Enter role' },
            },
          ],
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

export const arrayInsideGroupScenario: TestScenario = {
  testId: 'array-inside-group',
  title: 'Array Inside Group',
  description: 'Verify that array fields work correctly when nested inside a group container',
  config,
};
