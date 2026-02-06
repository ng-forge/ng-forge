import {
  LogicConfig,
  NonFieldLogicConfig,
  resolveNonFieldDisabled,
  resolveNonFieldHidden,
  RootFormRegistryService,
} from '@ng-forge/dynamic-forms';
import { FieldTree } from '@angular/forms/signals';

/**
 * Field definition with optional hidden/disabled and logic properties.
 * This is the minimal interface needed by applyNonFieldLogic.
 */
export interface FieldDefWithLogic {
  hidden?: boolean;
  disabled?: boolean;
  logic?: NonFieldLogicConfig[] | LogicConfig[];
}

/**
 * Result of applying non-field logic to a field.
 * Only includes properties that have values to apply.
 */
export interface NonFieldLogicResult {
  hidden?: boolean;
  disabled?: boolean;
}

/**
 * Applies hidden and disabled logic to a non-form-bound field.
 * Must be called inside a computed() context (reads form signals).
 */
export function applyNonFieldLogic(rootFormRegistry: RootFormRegistryService, fieldDef: FieldDefWithLogic): NonFieldLogicResult {
  const result: NonFieldLogicResult = {};
  const rootForm = rootFormRegistry.rootForm();

  if (rootForm) {
    if (fieldDef.hidden !== undefined || fieldDef.logic?.some((l) => l.type === 'hidden')) {
      const hiddenSignal = resolveNonFieldHidden({
        form: rootForm,
        fieldLogic: fieldDef.logic,
        explicitValue: fieldDef.hidden,
      });
      result.hidden = hiddenSignal();
    }

    // Resolve disabled state if explicitly set or has logic
    if (fieldDef.disabled !== undefined || fieldDef.logic?.some((l) => l.type === 'disabled')) {
      // Create the signal and READ IT to establish reactive dependencies
      const disabledSignal = resolveNonFieldDisabled({
        form: rootForm,
        fieldLogic: fieldDef.logic,
        explicitValue: fieldDef.disabled,
      });
      result.disabled = disabledSignal();
    }
  } else {
    // Fallback to static values when rootForm is not available
    if (fieldDef.hidden !== undefined) {
      result.hidden = fieldDef.hidden;
    }
    if (fieldDef.disabled !== undefined) {
      result.disabled = fieldDef.disabled;
    }
  }

  return result;
}

/**
 * Applies hidden logic to a non-form-bound field.
 *
 * This is a focused utility for fields that only need hidden state resolution.
 * Use this when you need hidden logic but handle disabled separately
 * (e.g., navigation buttons with custom disabled logic).
 *
 * NOTE: This function must be called inside a computed() context.
 *
 * @param rootForm The root form FieldTree (can be undefined)
 * @param fieldDef The field definition with optional hidden/logic
 * @returns The resolved hidden boolean value, or undefined if no hidden logic
 */
export function resolveHiddenValue(
  rootForm: FieldTree<unknown, string | number> | undefined,
  fieldDef: FieldDefWithLogic,
): boolean | undefined {
  if (!rootForm) {
    return fieldDef.hidden;
  }

  if (fieldDef.hidden !== undefined || fieldDef.logic?.some((l) => l.type === 'hidden')) {
    return resolveNonFieldHidden({
      form: rootForm,
      fieldLogic: fieldDef.logic,
      explicitValue: fieldDef.hidden,
      // formValue omitted intentionally - resolver will read form.value() reactively
    })();
  }

  return undefined;
}
