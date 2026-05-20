import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Regression test for the readonly DOM-sync workaround removal — a runtime
 * toggle of `readonly()` on the field state must propagate to the native
 * `readonly` attribute on the underlying `<textarea>`. Previously a viewChild
 * + afterRenderEffect was needed; Angular 21.0.7's `[formField]` now does
 * this natively. If a regression in Angular re-breaks the sync, this test
 * fails immediately instead of silently shipping a broken textarea.
 */
const config = {
  fields: [
    {
      key: 'lockEdit',
      type: 'checkbox',
      label: 'Lock textarea',
      value: false,
    },
    {
      key: 'notes',
      type: 'textarea',
      label: 'Notes',
      value: 'initial content',
      logic: [
        {
          type: 'readonly',
          condition: {
            type: 'fieldValue',
            fieldPath: 'lockEdit',
            operator: 'equals',
            value: true,
          },
        },
      ],
    },
  ],
} as const satisfies FormConfig;

export const textareaReadonlyRuntimeScenario: TestScenario = {
  testId: 'textarea-readonly-runtime',
  title: 'Textarea - Runtime Readonly Toggle',
  description: 'Toggles readonly() at runtime via a logic rule and asserts the native DOM attribute syncs in both directions',
  config,
};
