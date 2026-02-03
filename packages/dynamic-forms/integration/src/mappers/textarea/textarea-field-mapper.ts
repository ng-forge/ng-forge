import { computed, inject, Signal } from '@angular/core';
import { DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES } from '@ng-forge/dynamic-forms';
import { TextareaField } from '../../definitions';
import { resolveValueFieldContext, buildValueFieldInputs } from '../value/value-field.mapper';

/**
 * Maps a textarea field to component inputs.
 *
 * Extends the base value field mapper by adding textarea-specific properties:
 * - rows: Number of visible text rows
 * - cols: Number of visible text columns
 * - maxLength: Maximum character length (also used for validation)
 *
 * @param fieldDef The textarea field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function textareaFieldMapper<TProps>(fieldDef: TextareaField<TProps>): Signal<Record<string, unknown>> {
  const ctx = resolveValueFieldContext();
  const defaultProps = inject(DEFAULT_PROPS);
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES);

  return computed(() => {
    const inputs = buildValueFieldInputs(fieldDef, ctx, defaultProps(), defaultValidationMessages());

    // Add textarea-specific properties from props
    const props = fieldDef.props as Record<string, unknown> | undefined;
    if (props && typeof props === 'object') {
      if (props['rows'] !== undefined) {
        inputs['rows'] = props['rows'];
      }
      if (props['cols'] !== undefined) {
        inputs['cols'] = props['cols'];
      }
    }

    // maxLength is at field level for validation
    if (fieldDef.maxLength !== undefined) {
      inputs['maxLength'] = fieldDef.maxLength;
    }

    return inputs;
  });
}
