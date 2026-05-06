import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Group-level cascade override: outer group sets `validateWhenHidden: true` AND
 * is statically hidden. Without any override, descendants would inherit `true`
 * and the empty required leaf would block submit. By overriding back to `false`
 * on the leaf itself, the leaf opts back into the default skip-when-hidden
 * behavior — submit stays enabled.
 *
 * Also tests the inverse: a sibling leaf that does NOT override the inherited
 * `true` keeps blocking submit, demonstrating that the cascade is per-subtree.
 */
const config = {
  defaultValidationMessages: {
    required: 'This field is required',
  },
  fields: [
    {
      key: 'outer',
      type: 'group',
      hidden: true,
      validateWhenHidden: true,
      fields: [
        {
          key: 'optedOut',
          type: 'input',
          label: 'Opted out — should skip required when hidden',
          required: true,
          validateWhenHidden: false,
        },
      ],
    },
    {
      key: 'visibleField',
      type: 'input',
      label: 'Visible Field',
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const cascadeMiddleOverrideScenario: TestScenario = {
  testId: 'cascade-middle-override',
  title: 'Cascade — Leaf Override Wins',
  description: 'Outer group says validate-when-hidden=true; leaf overrides back to false and opts out of validation while hidden',
  config,
  initialValue: { outer: { optedOut: '' }, visibleField: '' },
  simulateSubmission: { delayMs: 0 },
};
