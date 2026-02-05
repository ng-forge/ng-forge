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
 *
 * This utility extracts the common pattern used across button mappers for
 * resolving hidden/disabled states. It handles:
 * 1. Explicit `hidden: true` / `disabled: true` on the field definition
 * 2. Field-level `logic` array with `type: 'hidden'` or `type: 'disabled'` conditions
 * 3. Fallback to static values when rootForm is unavailable
 *
 * NOTE: This function must be called inside a computed() context since it
 * reads signals from the form and rootFormRegistry.
 *
 * @param rootFormRegistry The root form registry service
 * @param fieldDef The field definition with optional hidden/disabled/logic
 * @returns Object with hidden and/or disabled boolean values to spread into inputs
 *
 * @example
 * ```typescript
 * return computed(() => {
 *   const baseInputs = buildBaseInputs(fieldDef, defaultProps());
 *   const logicResult = applyNonFieldLogic(rootFormRegistry, fieldDef);
 *
 *   return {
 *     ...baseInputs,
 *     event: SomeEvent,
 *     ...logicResult,
 *   };
 * });
 * ```
 */
export function applyNonFieldLogic(rootFormRegistry: RootFormRegistryService, fieldDef: FieldDefWithLogic): NonFieldLogicResult {
  const result: NonFieldLogicResult = {};
  const rootForm = rootFormRegistry.getRootForm();

  if (rootForm) {
    const formValue = rootFormRegistry.getFormValue();

    // Resolve hidden state if explicitly set or has logic
    if (fieldDef.hidden !== undefined || fieldDef.logic?.some((l) => l.type === 'hidden')) {
      result.hidden = resolveNonFieldHidden({
        form: rootForm,
        fieldLogic: fieldDef.logic,
        explicitValue: fieldDef.hidden,
        formValue,
      })();
    }

    // Resolve disabled state if explicitly set or has logic
    if (fieldDef.disabled !== undefined || fieldDef.logic?.some((l) => l.type === 'disabled')) {
      result.disabled = resolveNonFieldDisabled({
        form: rootForm,
        fieldLogic: fieldDef.logic,
        explicitValue: fieldDef.disabled,
        formValue,
      })();
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
 * @param formValue The current form value for expression evaluation
 * @param fieldDef The field definition with optional hidden/logic
 * @returns The resolved hidden boolean value, or undefined if no hidden logic
 */
export function resolveHiddenValue(
  rootForm: FieldTree<unknown, string | number> | undefined,
  formValue: unknown,
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
      formValue,
    })();
  }

  return undefined;
}
