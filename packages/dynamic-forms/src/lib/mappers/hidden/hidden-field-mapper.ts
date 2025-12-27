import { signal, Signal } from '@angular/core';
import { HiddenField } from '../../definitions/default/hidden-field';

/**
 * Maps a hidden field definition to component inputs.
 *
 * Hidden fields are componentless - they participate in the form schema
 * but don't render any UI. This mapper returns an empty signal since
 * there's no component to bind inputs to.
 *
 * The hidden field's value is handled by the form schema system directly,
 * not through component bindings.
 *
 * @returns Signal containing empty record (no component inputs needed)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Parameter required by MapperFn signature
export function hiddenFieldMapper(_fieldDef: HiddenField): Signal<Record<string, unknown>> {
  return signal({});
}
