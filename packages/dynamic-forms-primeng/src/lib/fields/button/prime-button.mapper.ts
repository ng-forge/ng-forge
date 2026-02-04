import { computed, inject, isSignal, Signal } from '@angular/core';
import { ARRAY_CONTEXT, buildBaseInputs, DEFAULT_PROPS, FieldDef } from '@ng-forge/dynamic-forms';

/**
 * Generic button mapper for custom events or basic buttons.
 * For specific button types (submit, next, prev, add/remove array items),
 * use the dedicated field types and their specific mappers.
 *
 * Supports template property for array events (AppendArrayItemEvent, PrependArrayItemEvent, InsertArrayItemEvent)
 * which enables the $template token in eventArgs.
 *
 * @param fieldDef The button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function buttonFieldMapper(fieldDef: FieldDef<Record<string, unknown>>): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const arrayContext = inject(ARRAY_CONTEXT, { optional: true });

  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());

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

    // Add eventContext for token resolution (supports $template, $arrayKey, $index, etc.)
    const template = 'template' in fieldDef ? fieldDef.template : undefined;
    if (template || arrayContext) {
      // Read signal value if index is a signal (supports differential updates)
      const getIndex = () => {
        if (!arrayContext) return -1;
        return isSignal(arrayContext.index) ? arrayContext.index() : arrayContext.index;
      };

      inputs['eventContext'] = {
        key: fieldDef.key,
        index: getIndex(),
        arrayKey: arrayContext?.arrayKey ?? '',
        formValue: arrayContext?.formValue ?? {},
        template,
      };
    }

    return inputs;
  });
}
