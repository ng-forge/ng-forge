import { computed, inject, Signal } from '@angular/core';
import {
  buildBaseInputs,
  DEFAULT_PROPS,
  FormEvent,
  resolveNonFieldDisabled,
  resolveNonFieldHidden,
  RootFormRegistryService,
} from '@ng-forge/dynamic-forms';
import { ButtonField } from '../../definitions';

/**
 * Maps a button field to component inputs.
 *
 * Unlike value field mappers, button fields do not participate in form values
 * and do not need field tree resolution or validation messages.
 *
 * Button-specific properties:
 * - event: The FormEvent constructor to emit when clicked
 * - eventArgs: Optional arguments to pass to the event constructor
 *
 * Hidden and disabled states are resolved using non-field logic resolvers which consider:
 * 1. Explicit `hidden: true` / `disabled: true` on the field definition
 * 2. Field-level `logic` array with `type: 'hidden'` or `type: 'disabled'` conditions
 *
 * @param fieldDef The button field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function buttonFieldMapper<TProps, TEvent extends FormEvent>(
  fieldDef: ButtonField<TProps, TEvent>,
): Signal<Record<string, unknown>> {
  const defaultProps = inject(DEFAULT_PROPS);
  const rootFormRegistry = inject(RootFormRegistryService);

  return computed(() => {
    const inputs = buildBaseInputs(fieldDef, defaultProps());
    const rootForm = rootFormRegistry.getRootForm();

    // Add button-specific properties
    inputs['event'] = fieldDef.event;

    if (fieldDef.eventArgs !== undefined) {
      inputs['eventArgs'] = fieldDef.eventArgs;
    }

    // Resolve hidden and disabled states (supports logic array)
    if (rootForm) {
      const formValue = rootFormRegistry.getFormValue();

      if (fieldDef.hidden !== undefined || fieldDef.logic?.some((l) => l.type === 'hidden')) {
        const hiddenSignal = resolveNonFieldHidden({
          form: rootForm,
          fieldLogic: fieldDef.logic,
          explicitValue: fieldDef.hidden,
          formValue,
        });
        inputs['hidden'] = hiddenSignal();
      }

      if (fieldDef.disabled !== undefined || fieldDef.logic?.some((l) => l.type === 'disabled')) {
        const disabledSignal = resolveNonFieldDisabled({
          form: rootForm,
          fieldLogic: fieldDef.logic,
          explicitValue: fieldDef.disabled,
          formValue,
        });
        inputs['disabled'] = disabledSignal();
      }
    } else {
      // Fallback to static values when rootForm is not available
      if (fieldDef.disabled !== undefined) {
        inputs['disabled'] = fieldDef.disabled;
      }
      if (fieldDef.hidden !== undefined) {
        inputs['hidden'] = fieldDef.hidden;
      }
    }

    return inputs;
  });
}
