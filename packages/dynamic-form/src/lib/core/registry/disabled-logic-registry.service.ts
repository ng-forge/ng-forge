import { Injectable, Signal, computed, signal } from '@angular/core';

/**
 * Registry service for tracking disabled logic on form fields.
 *
 * Since Angular's signal forms doesn't provide a built-in disabled() function
 * like it does for hidden() and readonly(), we need to track disabled state
 * separately and make it available to field components.
 */
@Injectable()
export class DisabledLogicRegistryService {
  private readonly disabledLogic = signal<Map<string, Signal<boolean>>>(new Map());

  /**
   * Register a disabled logic function for a specific field path
   */
  registerDisabledLogic(fieldPath: string, logicFn: () => boolean): void {
    const disabledSignal = computed(logicFn);
    const currentMap = new Map(this.disabledLogic());
    currentMap.set(fieldPath, disabledSignal);
    this.disabledLogic.set(currentMap);
  }

  /**
   * Get the disabled signal for a specific field path
   * Returns a signal that evaluates to true if the field should be disabled
   */
  getDisabledSignal(fieldPath: string): Signal<boolean> {
    return computed(() => {
      const map = this.disabledLogic();
      const disabledSignal = map.get(fieldPath);
      return disabledSignal ? disabledSignal() : false;
    });
  }

  /**
   * Check if a field has disabled logic registered
   */
  hasDisabledLogic(fieldPath: string): boolean {
    return this.disabledLogic().has(fieldPath);
  }

  /**
   * Clear all disabled logic (useful for cleanup)
   */
  clear(): void {
    this.disabledLogic.set(new Map());
  }
}
