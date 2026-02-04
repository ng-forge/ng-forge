import { computed, Provider, Signal } from '@angular/core';
import {
  DEFAULT_PROPS,
  DEFAULT_VALIDATION_MESSAGES,
  EXTERNAL_DATA,
  FIELD_SIGNAL_CONTEXT,
  FORM_OPTIONS,
} from '../models/field-signal-context.token';
import { FormStateManager } from './form-state-manager';

/**
 * Creates provider factories that read form-level configuration from FormStateManager.
 *
 * These providers make form configuration available to child components via Angular's
 * hierarchical DI. Instead of providing static values, they provide computed signals
 * that react to config changes.
 *
 * **Usage in DynamicFormComponent:**
 * ```typescript
 * @Component({
 *   providers: [
 *     FormStateManager,
 *     ...createFormStateProviders(),
 *   ],
 * })
 * ```
 *
 * **Why signals instead of values:**
 * - Config can change at runtime (reactive forms)
 * - Child components need to react to config updates
 * - Two-phase transitions require config-aware rendering
 *
 * @returns Array of providers for form-level injection tokens
 *
 * @internal
 */
export function createFormStateProviders(): Provider[] {
  return [
    // DEFAULT_PROPS: Form-wide property defaults for fields
    {
      provide: DEFAULT_PROPS,
      useFactory: (stateManager: FormStateManager) =>
        computed(() => stateManager.activeConfig()?.defaultProps) as Signal<Record<string, unknown> | undefined>,
      deps: [FormStateManager],
    },

    // DEFAULT_VALIDATION_MESSAGES: Fallback validation messages
    {
      provide: DEFAULT_VALIDATION_MESSAGES,
      useFactory: (stateManager: FormStateManager) => computed(() => stateManager.activeConfig()?.defaultValidationMessages),
      deps: [FormStateManager],
    },

    // FORM_OPTIONS: Form-wide options (disabled state, button behavior, etc.)
    {
      provide: FORM_OPTIONS,
      useFactory: (stateManager: FormStateManager) => stateManager.effectiveFormOptions,
      deps: [FormStateManager],
    },

    // EXTERNAL_DATA: Application state signals for conditional logic
    {
      provide: EXTERNAL_DATA,
      useFactory: (stateManager: FormStateManager) => computed(() => stateManager.activeConfig()?.externalData),
      deps: [FormStateManager],
    },
  ];
}

/**
 * Creates provider for FIELD_SIGNAL_CONTEXT that reads from FormStateManager.
 *
 * This is separate from `createFormStateProviders()` because FIELD_SIGNAL_CONTEXT
 * is also provided by container components (Group, Array) with scoped values.
 *
 * @returns Provider for FIELD_SIGNAL_CONTEXT
 *
 * @internal
 */
export function createFieldSignalContextProvider(): Provider {
  return {
    provide: FIELD_SIGNAL_CONTEXT,
    useFactory: (stateManager: FormStateManager) => stateManager.fieldSignalContext(),
    deps: [FormStateManager],
  };
}

/**
 * Creates all form-level providers including FIELD_SIGNAL_CONTEXT.
 *
 * Use this when you need all form providers in a single call.
 *
 * @returns Array of all form-level providers
 *
 * @internal
 */
export function createAllFormProviders(): Provider[] {
  return [...createFormStateProviders(), createFieldSignalContextProvider()];
}
