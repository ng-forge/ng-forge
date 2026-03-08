import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test container-level hidden logic on a row.
 * The `logic` property is set directly on the row container to hide/show
 * the entire row and all its children at once.
 */
const config = {
  fields: [
    {
      key: 'showContactInfo',
      type: 'checkbox',
      label: 'Show Contact Info',
      value: true,
    },
    {
      key: 'contactRow',
      type: 'row',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'showContactInfo',
            operator: 'equals',
            value: false,
          },
        },
      ],
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          col: 4,
          props: { placeholder: 'Enter first name' },
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          col: 4,
          props: { placeholder: 'Enter last name' },
        },
        {
          key: 'phone',
          type: 'input',
          label: 'Phone',
          col: 4,
          props: { placeholder: 'Enter phone' },
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

export const rowHiddenLogicScenario: TestScenario = {
  testId: 'row-hidden-logic',
  title: 'Row Container Hidden Logic',
  description: 'Verify that a row container can be hidden/shown using logic directly on the container',
  config,
};
