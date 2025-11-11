import { Signal, computed, inject } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { DisabledLogicRegistryService } from '../core/registry';

/**
 * Gets the disabled signal for a field from the disabled logic registry
 *
 * @param fieldKey - The field key/path to get disabled logic for
 * @param field - The field tree signal to extract context from
 * @returns Signal<boolean> - True if field should be disabled
 */
export function getDisabledSignal(fieldKey: string, field: Signal<FieldTree<unknown>>): Signal<boolean> {
  const disabledLogicRegistry = inject(DisabledLogicRegistryService, { optional: true });

  return computed(() => {
    if (!disabledLogicRegistry) {
      return false;
    }

    // Get the field context from the FieldTree
    const fieldTree = field();
    const ctx = fieldTree as any; // FieldTree is FieldContext

    return disabledLogicRegistry.getDisabledSignal(fieldKey, ctx)();
  });
}
