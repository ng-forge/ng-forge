import { PageField } from '../../definitions/default/page-field';
import { Binding, inputBinding } from '@angular/core';
import { FieldMapperOptions } from '../types';

/**
 * Page field mapper - maps page field properties to component inputs
 * Like row fields, page fields pass through the parent form context without modification
 *
 * @param fieldDef The page field definition
 * @param options Field mapper options containing form context
 * @returns Array of input bindings for the page component
 */
export function pageFieldMapper(fieldDef: PageField, options?: Omit<FieldMapperOptions, 'fieldRegistry'>): Binding[] {
  const bindings: Binding[] = [];

  bindings.push(inputBinding('key', () => fieldDef.key));

  // Bind the field definition
  bindings.push(inputBinding('field', () => fieldDef));

  if (options) {
    // Pass through parent form context - page doesn't change form shape like row
    bindings.push(inputBinding('form', () => options.fieldSignalContext.form));
    bindings.push(inputBinding('fieldSignalContext', () => options.fieldSignalContext));

    // Pass arrayContext if this page is rendered inside an array
    if (options.arrayContext) {
      bindings.push(inputBinding('arrayContext', () => options.arrayContext));
    }
  }

  return bindings;
}
