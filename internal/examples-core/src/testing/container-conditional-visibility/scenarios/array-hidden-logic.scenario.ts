import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test container-level hidden logic on an array.
 * The `logic` property is set directly on the array container and the
 * addArrayItem button to hide/show the entire array at once.
 */
const memberFields = [
  {
    key: 'name',
    type: 'input',
    label: 'Name',
    col: 6,
    props: { placeholder: 'Enter name' },
  },
  {
    key: 'email',
    type: 'input',
    label: 'Email',
    col: 6,
    props: { placeholder: 'Enter email' },
  },
];

const config = {
  fields: [
    {
      key: 'enableMembers',
      type: 'checkbox',
      label: 'Enable Members',
      value: true,
    },
    {
      key: 'members',
      type: 'array',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'enableMembers',
            operator: 'equals',
            value: false,
          },
        },
      ],
      fields: [memberFields],
    },
    {
      key: 'addMember',
      type: 'addArrayItem',
      arrayKey: 'members',
      label: 'Add Member',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'enableMembers',
            operator: 'equals',
            value: false,
          },
        },
      ],
      template: memberFields,
    },
    {
      key: 'notes',
      type: 'input',
      label: 'Notes',
      props: { placeholder: 'Always visible' },
    },
  ],
} as FormConfig;

export const arrayHiddenLogicScenario: TestScenario = {
  testId: 'array-hidden-logic',
  title: 'Array Container Hidden Logic',
  description: 'Verify that an array container can be hidden/shown using logic directly on the container',
  config,
};
