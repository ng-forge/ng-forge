import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test container-level hidden logic on a group.
 * The `logic` property is set directly on the group container to hide/show
 * the entire group and all its children at once.
 */
const config = {
  fields: [
    {
      key: 'showAddress',
      type: 'checkbox',
      label: 'Show Address',
      value: true,
    },
    {
      key: 'addressGroup',
      type: 'group',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'showAddress',
            operator: 'equals',
            value: false,
          },
        },
      ],
      fields: [
        {
          key: 'street',
          type: 'input',
          label: 'Street',
          props: { placeholder: 'Enter street' },
        },
        {
          key: 'city',
          type: 'input',
          label: 'City',
          props: { placeholder: 'Enter city' },
        },
        {
          key: 'zip',
          type: 'input',
          label: 'ZIP Code',
          props: { placeholder: 'Enter ZIP' },
        },
      ],
    },
    {
      key: 'notes',
      type: 'input',
      label: 'Notes',
      props: { placeholder: 'Always visible' },
    },
  ],
} as const satisfies FormConfig;

export const groupHiddenLogicScenario: TestScenario = {
  testId: 'group-hidden-logic',
  title: 'Group Container Hidden Logic',
  description: 'Verify that a group container can be hidden/shown using logic directly on the container',
  config,
};
