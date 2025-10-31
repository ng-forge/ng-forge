import { FieldDef } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';
import { entries, omit } from 'lodash-es';

export function baseFieldMapper({ disabled, readonly, hidden, label, className, tabIndex, props, ...fieldDef }: FieldDef<any>): Binding[] {
  const bindings: Binding[] = [];

  if (disabled) {
    bindings.push(inputBinding('disabled', () => disabled));
  }

  if (readonly) {
    bindings.push(inputBinding('readonly', () => readonly));
  }

  if (hidden) {
    bindings.push(inputBinding('hidden', () => hidden));
  }

  if (label) {
    bindings.push(inputBinding('label', () => label));
  }

  if (className) {
    bindings.push(inputBinding('className', () => className));
  }

  if (tabIndex) {
    bindings.push(inputBinding('tabIndex', () => tabIndex));
  }

  if (props) {
    bindings.push(inputBinding('props', () => props));
  }

  const remainingProperties = omit(fieldDef, ['key', 'type', 'conditionals', 'validation']);

  entries(remainingProperties).forEach(([key, value]) => {
    bindings.push(inputBinding(key, () => value));
  });

  return bindings;
}
