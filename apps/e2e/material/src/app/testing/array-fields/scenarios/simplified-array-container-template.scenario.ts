import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Regression: simplified array whose template is a single bare `container`
 * FieldDef with wrappers.
 *
 * Two cherry-picked fixes guard this combo:
 *   1. `array-field.component#handleAddFromEvent` — single-FieldDef containers
 *      (valueHandling: 'flatten') must be treated as object items, not
 *      primitives. Pre-fix, clicking "Add address" on this shape silently
 *      broke because the new item was appended as a primitive value.
 *   2. `container-field-mapper` / `expandSimplifiedArray` — wrappers on
 *      template fields used to be dropped on the first add (double-wrap +
 *      wrappers nullified on field input). Pre-fix, the section card
 *      vanished or duplicated when a row was appended.
 *
 * The expected emitted form value is FLAT inside each array entry — the
 * `container`'s child keys (`street`, `city`) live directly on the array
 * item, with no `entry` key wrapping them.
 */
const config = {
  fields: [
    {
      key: 'addresses',
      type: 'array',
      minLength: 0,
      addButton: { label: 'Add address' },
      // Bare container FieldDef as the item template — primitive-API path
      // for a flatten-valueHandling field. This is the exact shape both
      // dereekb fixes target.
      template: {
        key: 'entry',
        type: 'container',
        wrappers: [{ type: 'section', title: 'Address' }],
        fields: [
          { key: 'street', type: 'input', label: 'Street', value: '' },
          { key: 'city', type: 'input', label: 'City', value: '' },
        ],
      },
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Save',
    },
  ],
} as const satisfies FormConfig;

export const simplifiedArrayContainerTemplateScenario: TestScenario = {
  testId: 'simplified-array-container-template',
  title: 'Simplified Array - Container + Wrapper Template',
  description:
    'Array whose item template is a single container FieldDef with a section wrapper. Verifies fixes for handleAddFromEvent (flatten) and container-mapper double-wrap.',
  config,
};
