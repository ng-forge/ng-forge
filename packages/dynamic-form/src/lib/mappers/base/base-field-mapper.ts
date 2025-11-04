import { FieldDef } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';
import { entries } from 'lodash-es';
import { getGridClassString } from '../../utils/grid-classes/grid-classes';

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
  ]);

  for (const [key, value] of entries(fieldDef)) {
    if (!excludedKeys.has(key) && !validationKeys.has(key) && value !== undefined) {
      bindings.push(inputBinding(key, () => value));
    }
  }

  return bindings;
}
