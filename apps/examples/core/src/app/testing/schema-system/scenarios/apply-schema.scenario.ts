import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests the basic "apply" schema that applies validators unconditionally.
 * The email field uses a reusable schema that combines required + email validators.
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
  },
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      schemas: [{ type: 'apply', schema: 'requiredEmail' }],
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

export const applySchemaScenario: TestScenario = {
  testId: 'apply-schema-test',
  title: 'Apply Schema',
  description: 'Tests unconditional schema application combining required and email validators',
  config,
};
