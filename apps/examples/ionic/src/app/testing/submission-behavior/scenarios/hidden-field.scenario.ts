import { TestScenario } from '../../shared/types';

/**
 * Hidden Field Scenario
 * Tests that hidden field values are included in form submissions without rendering any UI
 */
export const hiddenFieldScenario: TestScenario = {
  testId: 'hidden-field',
  title: 'Hidden Field',
  description:
    'Tests that hidden fields store values in the form model without rendering UI elements. ' +
    'Hidden fields are useful for persisting IDs, metadata, or other non-user-facing data.',
  config: {
    fields: [
      {
        key: 'id',
        type: 'hidden',
        value: 'uuid-550e8400-e29b-41d4-a716-446655440000',
      },
      {
        key: 'version',
        type: 'hidden',
        value: 42,
      },
      {
        key: 'isActive',
        type: 'hidden',
        value: true,
      },
      {
        key: 'tagIds',
        type: 'hidden',
        value: [1, 2, 3],
      },
      {
        key: 'labels',
        type: 'hidden',
        value: ['draft', 'review'],
      },
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        props: {
          placeholder: 'Enter your name',
        },
        required: true,
        col: 12,
      },
      {
        key: 'submitHidden',
        type: 'submit',
        label: 'Submit',
        col: 12,
      },
    ],
  },
  initialValue: {},
  mockEndpoint: {
    url: '/api/hidden-field-submit',
    method: 'POST',
  },
};
