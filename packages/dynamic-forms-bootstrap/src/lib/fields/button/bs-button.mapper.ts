import { computed, inject, Signal } from '@angular/core';
import { buildBaseInputs, DEFAULT_PROPS, FieldDef } from '@ng-forge/dynamic-forms';

/**
 * Generic button mapper for custom events or basic buttons.
 * For specific button types (submit, next, prev, add/remove array items),
 * use the dedicated field types and their specific mappers.
 *
 * @param fieldDef The button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function buttonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS, { optional: true }) ?? undefined;

  // Build base inputs (static, from field definition)
  const baseInputs = buildBaseInputs(fieldDef, defaultProps);

  return computed(() => {
    const inputs: Record<string, unknown> = {
      ...baseInputs,
    };

    if (fieldDef.disabled !== undefined) {
      inputs['disabled'] = fieldDef.disabled;
    }

    if (fieldDef.hidden !== undefined) {
      inputs['hidden'] = fieldDef.hidden;
    }

    // Add event binding for button events
    if ('event' in fieldDef && fieldDef.event !== undefined) {
      inputs['event'] = fieldDef.event;
    }

    // Add eventArgs binding if provided
    if ('eventArgs' in fieldDef && fieldDef.eventArgs !== undefined) {
      inputs['eventArgs'] = fieldDef.eventArgs;
    }

    return inputs;
  });
}
