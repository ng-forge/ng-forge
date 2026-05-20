import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Bootstrap mirror of the Material textarea-readonly-runtime regression test.
 * Verifies that toggling readonly() at runtime propagates to the native
 * `<textarea>` readonly attribute after the afterRenderEffect workaround
 * was removed from bs-textarea.component.ts.
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
