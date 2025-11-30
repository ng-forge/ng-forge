import { FieldDef } from '../../definitions/base/field-def';
import { Binding, inputBinding } from '@angular/core';
import { getGridClassString } from '../../utils/grid-classes/grid-classes';

const validationKeys = new Set(['required', 'email', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'validators', 'logic']);

const excludedKeys = new Set([
  'col',
  'type',
  'conditionals',
  'validation',
  'label',
  'className',
  'tabIndex',
  'props',
  'disabled',
  'readonly',
  'hidden',
  'required',
  'minValue', // Handled by Field directive metadata (MIN)
  'maxValue', // Handled by Field directive metadata (MAX)
  'step', // Passed via props instead
  'validationMessages', // Handled in value/checkbox mappers
  'defaultValue', // Used for form reset/clear, not passed to components
  'arrayKey',
]);

export function baseFieldMapper(fieldDef: FieldDef<any>): Binding[] {
  const { label, className, tabIndex, props } = fieldDef;
  const bindings: Binding[] = [];

  if (label !== undefined) {
    bindings.push(inputBinding('label', () => label));
  }

  // Combine user className with generated grid classes
  const gridClassString = getGridClassString(fieldDef);
  const allClasses: string[] = [];

  if (gridClassString) {
    allClasses.push(gridClassString);
  }

  if (className) {
    allClasses.push(className);
  }

  if (allClasses.length > 0) {
    bindings.push(inputBinding('className', () => allClasses.join(' ')));
  }

  if (tabIndex !== undefined) {
    bindings.push(inputBinding('tabIndex', () => tabIndex));
  }

  if (props !== undefined) {
    bindings.push(inputBinding('props', () => props));
  }

  for (const [key, value] of Object.entries(fieldDef)) {
    if (!excludedKeys.has(key) && !validationKeys.has(key) && value !== undefined) {
      bindings.push(inputBinding(key, () => value));
    }
  }

  return bindings;
}
