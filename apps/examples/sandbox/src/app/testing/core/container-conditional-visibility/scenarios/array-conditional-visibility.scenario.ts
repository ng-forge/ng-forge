import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test conditional visibility of fields INSIDE an array.
 * Tests logic on fields inside the container.
 * Note: containers also support `logic: [{ type: 'hidden' }]` directly.
 */
const teamMemberFields = [
  {
    key: 'name',
    type: 'input',
    label: 'Team Member Name',
    col: 6,
    logic: [
      {
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'subscriptionType',
          operator: 'notEquals',
          value: 'pro',
        },
      },
    ],
    props: {
      placeholder: 'Enter name',
    },
  },
  {
    key: 'role',
    type: 'select',
    label: 'Role',
    col: 6,
    logic: [
      {
        type: 'hidden',
        condition: {
          type: 'fieldValue',
          fieldPath: 'subscriptionType',
          operator: 'notEquals',
          value: 'pro',
        },
      },
    ],
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
  },
];

const config = {
  fields: [
    {
      key: 'subscriptionType',
      type: 'radio',
      label: 'Subscription Type',
      options: [
        { value: 'free', label: 'Free' },
        { value: 'pro', label: 'Pro' },
      ],
      value: 'free',
    },
    {
      key: 'teamMembers',
      type: 'array',
      fields: [teamMemberFields],
    },
    {
      key: 'addTeamMember',
      type: 'addArrayItem',
      arrayKey: 'teamMembers',
      label: 'Add Team Member',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'subscriptionType',
            operator: 'notEquals',
            value: 'pro',
          },
        },
      ],
      template: teamMemberFields,
    },
    {
      key: 'notes',
      type: 'textarea',
      label: 'Notes',
      props: {
        placeholder: 'Additional notes',
      },
    },
  ],
} as FormConfig;

export const arrayConditionalVisibilityScenario: TestScenario = {
  testId: 'array-conditional-visibility',
  title: 'Array with Conditional Fields',
  description: 'Verify that fields inside arrays can be shown/hidden based on field values outside the array',
  config,
};
