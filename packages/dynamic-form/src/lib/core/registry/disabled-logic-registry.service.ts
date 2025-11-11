import { Injectable, Signal, computed, signal } from '@angular/core';
import { FieldContext, LogicFn } from '@angular/forms/signals';

/**
 * Registry service for tracking disabled logic on form fields.
 *
 * Since Angular's signal forms doesn't provide a built-in disabled() function
 * like it does for hidden() and readonly(), we need to track disabled state
 * separately and make it available to field components.
 */
@Injectable()
export class DisabledLogicRegistryService {
  private readonly disabledLogic = signal<Map<string, { logicFn: LogicFn<unknown, boolean>; ctx?: FieldContext<unknown> }>>(new Map());

  /**
   * Register a disabled logic function for a specific field path
   */
  registerDisabledLogic(fieldPath: string, logicFn: LogicFn<unknown, boolean>, ctx?: FieldContext<unknown>): void {
    const currentMap = new Map(this.disabledLogic());
    currentMap.set(fieldPath, { logicFn, ctx });
    this.disabledLogic.set(currentMap);
  }

  /**
   * Get the disabled signal for a specific field path
   * Returns a signal that evaluates to true if the field should be disabled
   */
  getDisabledSignal(fieldPath: string, ctx?: FieldContext<unknown>): Signal<boolean> {
    return computed(() => {
      const map = this.disabledLogic();
      const entry = map.get(fieldPath);
      if (!entry) {
        return false;
      }
      // Use the provided context or the registered context
      const context = ctx ?? entry.ctx;
      if (!context) {
        console.warn(`No FieldContext available for disabled logic on field: ${fieldPath}`);
        return false;
      }
      return entry.logicFn(context);
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
