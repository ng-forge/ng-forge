import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests the "applyWhen" schema that applies validators conditionally.
 * The contactEmail field becomes required with email validation only when
 * the user checks "I want to be contacted".
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'needsContact',
      type: 'checkbox',
      label: 'I want to be contacted',
      col: 12,
    },
    {
      key: 'contactEmail',
      type: 'input',
      label: 'Contact Email',
      schemas: [
        {
          type: 'applyWhen',
          schema: 'requiredEmail',
          condition: {
            type: 'fieldValue',
            fieldPath: 'needsContact',
            operator: 'equals',
            value: true,
          },
        },
      ],
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
  schemas: [
    {
      name: 'requiredEmail',
      validators: [{ type: 'required' }, { type: 'email' }],
    },
  ],
} as const satisfies FormConfig;

export const applyWhenSchemaScenario: TestScenario = {
  testId: 'apply-when-schema-test',
  title: 'Apply When Schema',
  description: 'Tests conditional schema application where email validation only applies when checkbox is checked',
  config,
};
