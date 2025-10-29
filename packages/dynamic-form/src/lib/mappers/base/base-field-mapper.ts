import { FieldDef } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';

export function baseFieldMapper<T>(fieldDef: FieldDef<any>): Binding[] {
  const bindings: Binding[] = [];

  if (fieldDef.disabled) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  if (fieldDef.readonly) {
    bindings.push(inputBinding('readonly', () => fieldDef.readonly));
  }

  if (fieldDef.hidden) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  if (fieldDef.label) {
    bindings.push(inputBinding('label', () => fieldDef.label));
  }

  if (fieldDef.className) {
    bindings.push(inputBinding('className', () => fieldDef.className));
  }

  if (fieldDef.tabIndex) {
    bindings.push(inputBinding('tabIndex', () => fieldDef.tabIndex));
  }

  if (fieldDef.props) {
    bindings.push(inputBinding('props', () => fieldDef.props));
  }

  return bindings;
}
