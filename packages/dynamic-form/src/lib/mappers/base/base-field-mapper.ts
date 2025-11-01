import { FieldDef } from '../../definitions';
import { Binding, inputBinding } from '@angular/core';
import { entries } from 'lodash-es';
import { FieldMapperOptions } from '../types';

export function baseFieldMapper(fieldDef: FieldDef<any>, options: Omit<FieldMapperOptions, 'fieldRegistry'>): Binding[] {
  const { key, label, className, tabIndex, props } = fieldDef;
  const bindings: Binding[] = [];

  const formRoot = options.fieldSignalContext.form();
  const childrenMap = (formRoot as any).structure?.childrenMap?.();

  const formField = childrenMap?.get(key);
  if (formField?.fieldProxy) {
    bindings.push(inputBinding('field', () => formField.fieldProxy));
  }

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
    if (!excludedKeys.has(key) && value !== undefined) {
      bindings.push(inputBinding(key, () => value));
    }
  }

  return bindings;
}
