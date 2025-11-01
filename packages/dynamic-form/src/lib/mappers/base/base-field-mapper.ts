import { FieldDef } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';
import { entries } from 'lodash-es';

export function baseFieldMapper(fieldDef: FieldDef<any>): Binding[] {
  const { label, className, tabIndex, props } = fieldDef;
  const bindings: Binding[] = [];

  if (label !== undefined) {
    bindings.push(inputBinding('label', () => label));
  }

  if (className !== undefined) {
    bindings.push(inputBinding('className', () => className));
  }

  if (tabIndex !== undefined) {
    bindings.push(inputBinding('tabIndex', () => tabIndex));
  }

  if (props !== undefined) {
    bindings.push(inputBinding('props', () => props));
  }

  const validationKeys = new Set(['required', 'email', 'min', 'max', 'minLength', 'maxLength', 'patternRule', 'validation']);

  const excludedKeys = new Set([
    'key',
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
