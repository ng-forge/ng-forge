import { Signal, computed, inject } from '@angular/core';
import { DisabledLogicRegistryService } from '../core/registry';

/**
 * Gets the disabled signal for a field from the disabled logic registry
 *
 * @param fieldKey - The field key/path to get disabled logic for
 * @returns Signal<boolean> - True if field should be disabled
 */
export function getDisabledSignal(fieldKey: string): Signal<boolean> {
  const disabledLogicRegistry = inject(DisabledLogicRegistryService, { optional: true });

  return computed(() => {
    if (!disabledLogicRegistry) {
      return false;
    }

    return disabledLogicRegistry.getDisabledSignal(fieldKey)();
  });
}
