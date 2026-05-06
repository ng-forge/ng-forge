import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Per-field override: a required field inside a statically hidden group with
 * `validateWhenHidden: true`. The cascade pushes `validateWhenHidden=true`
 * down to descendants, so validators register unconditionally and the empty
 * required leaf blocks submit even though its visual ancestor is hidden.
 *
 * Note: this works because group-level static `hidden: true` does NOT
 * propagate to the leaf's `state.hidden()` in Angular Signal Forms — it only
 * propagates via the cascading mapping context.
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'visibleField',
      type: 'input',
      label: 'Visible Field',
    },
    {
      key: 'hiddenSection',
      type: 'group',
      hidden: true,
      validateWhenHidden: true,
      fields: [
        {
          key: 'mustValidate',
          type: 'input',
          label: 'Required even when ancestor hidden',
          required: true,
        },
      ],
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const fieldValidateWhenHiddenScenario: TestScenario = {
  testId: 'field-validate-when-hidden',
  title: 'Cascade — validateWhenHidden=true Through Hidden Group',
  description: 'A required leaf inside a hidden group with validateWhenHidden=true keeps blocking submit',
  config,
  initialValue: { visibleField: '', hiddenSection: { mustValidate: '' } },
  simulateSubmission: { delayMs: 0 },
};
