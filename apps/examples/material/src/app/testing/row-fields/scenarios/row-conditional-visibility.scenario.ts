import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Test conditional visibility of fields INSIDE a row.
 * Note: Rows themselves don't support logic - they're layout-only containers.
 * This test verifies that fields within a row can still have conditional visibility.
 */
const config = {
  fields: [
    {
      key: 'showDetails',
      type: 'checkbox',
      label: 'Show Details',
      value: false,
    },
    {
      key: 'detailsRow',
      type: 'row',
      fields: [
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          col: 6,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'showDetails',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter first name',
          },
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          col: 6,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'showDetails',
                operator: 'equals',
                value: false,
              },
            },
          ],
          props: {
            placeholder: 'Enter last name',
          },
        },
      ],
    },
    {
      key: 'alwaysVisible',
      type: 'input',
      label: 'Always Visible Field',
      props: {
        placeholder: 'This field is always visible',
      },
    },
  ],
} as const satisfies FormConfig;

export const rowConditionalVisibilityScenario: TestScenario = {
  testId: 'row-conditional-visibility',
  title: 'Row with Conditional Fields',
  description: 'Verify that fields inside a row can be shown/hidden based on field values',
  config,
};
