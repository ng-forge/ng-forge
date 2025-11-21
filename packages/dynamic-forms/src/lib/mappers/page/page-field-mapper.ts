import { PageField } from '../../definitions/default/page-field';
import { Binding, inputBinding } from '@angular/core';

/**
 * Page field mapper - maps page field properties to component inputs
 * Page fields are layout containers that don't modify the form context.
 * The page component will inject FIELD_SIGNAL_CONTEXT directly.
 *
 * @param fieldDef The page field definition
 * @returns Array of input bindings for the page component
 */
export function pageFieldMapper(fieldDef: PageField): Binding[] {
  const bindings: Binding[] = [];

  bindings.push(inputBinding('key', () => fieldDef.key));

  // Bind the field definition
  bindings.push(inputBinding('field', () => fieldDef));

  return bindings;
}
