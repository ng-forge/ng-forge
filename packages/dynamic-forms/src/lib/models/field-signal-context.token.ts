import { InjectionToken, Signal } from '@angular/core';
import type { FieldSignalContext, ArrayContext } from '../mappers/types';
import type { ValidationMessages } from './validation-types';
import type { FormOptions } from './form-config';
import { DynamicFormError } from '../errors/dynamic-form-error';

/**
 * Injection token for providing field signal context to mappers and components.
 *
 * The field signal context is the "nervous system" of the dynamic form library,
 * providing access to:
 * - The form instance and structure
 * - Current form values (as signals)
 * - Default values
 * - Validation messages
 * - The injector for creating components
 *
 * This token is provided by the DynamicForm component and can be scoped
 * for nested forms (Groups, Arrays) via child injectors.
 *
 * @example
 * ```typescript
 * // In a mapper function
 * export function mapValueField(fieldDef: BaseValueField<any, any>): Binding[] {
 *   const context = inject(FIELD_SIGNAL_CONTEXT);
 *   const form = context.form();
 *   // ... use context
 * }
 *
 * // In a component
 * export class MyFieldComponent {
 *   private context = inject(FIELD_SIGNAL_CONTEXT);
 * }
 * ```
 */
export const FIELD_SIGNAL_CONTEXT = new InjectionToken<FieldSignalContext>('FIELD_SIGNAL_CONTEXT', {
  providedIn: null, // Not provided at root - must be provided by DynamicForm
  factory: () => {
    throw new DynamicFormError(
      'FIELD_SIGNAL_CONTEXT was not provided. ' +
        'This token must be provided by DynamicFormComponent or a container field component. ' +
        'If you are calling a mapper function directly, ensure it runs within runInInjectionContext() ' +
        'with an injector that provides FIELD_SIGNAL_CONTEXT.',
    );
  },
});

/**
 * Injection token for providing array context metadata to mappers and components.
 *
 * This token is optionally provided by ArrayFieldComponent when creating injectors
 * for array items. It contains metadata about the array item's position and parent.
 *
 * Mappers can inject this token with {optional: true} to access array context:
 *
 * @example
 * ```typescript
 * // In a mapper function
 * export function buttonMapper(fieldDef: FieldDef<any>): Binding[] {
 *   const arrayContext = inject(ARRAY_CONTEXT, { optional: true });
 *   if (arrayContext) {
 *     // Use arrayContext.index, arrayContext.arrayKey, etc.
 *   }
 * }
 * ```
 */
export const ARRAY_CONTEXT = new InjectionToken<ArrayContext>('ARRAY_CONTEXT');

/**
 * Injection token for form-level default props.
 *
 * Default props are form-wide property defaults that are merged with field-level props.
 * Field props take precedence over default props.
 *
 * Unlike FIELD_SIGNAL_CONTEXT which is re-provided by container components (Group, Array),
 * DEFAULT_PROPS is provided ONCE at the DynamicForm level and inherited by all children
 * via Angular's hierarchical injector.
 *
 * The token provides a Signal to enable reactivity - when config changes, mappers
 * that read the signal inside their computed() will automatically update.
 *
 * @example
 * ```typescript
 * // In a mapper function
 * const defaultPropsSignal = inject(DEFAULT_PROPS);
 *
 * return computed(() => {
 *   const defaultProps = defaultPropsSignal?.();  // Read inside computed for reactivity
 *   const baseInputs = buildBaseInputs(fieldDef, defaultProps);
 *   // ...
 * });
 * ```
 */
export const DEFAULT_PROPS = new InjectionToken<Signal<Record<string, unknown> | undefined>>('DEFAULT_PROPS');

/**
 * Injection token for form-level default validation messages.
 *
 * Default validation messages act as fallbacks when fields have validation
 * errors but no field-level `validationMessages` defined.
 *
 * Like DEFAULT_PROPS, this token is provided ONCE at the DynamicForm level
 * and inherited by all children via Angular's hierarchical injector.
 *
 * The token provides a Signal to enable reactivity - when config changes, mappers
 * that read the signal inside their computed() will automatically update.
 *
 * @example
 * ```typescript
 * // In a mapper or component
 * const defaultMessagesSignal = inject(DEFAULT_VALIDATION_MESSAGES);
 *
 * return computed(() => {
 *   const defaultMessages = defaultMessagesSignal?.();  // Read inside computed for reactivity
 *   const message = defaultMessages?.required ?? 'Field is required';
 *   // ...
 * });
 * ```
 */
export const DEFAULT_VALIDATION_MESSAGES = new InjectionToken<Signal<ValidationMessages | undefined>>('DEFAULT_VALIDATION_MESSAGES');

/**
 * Injection token for form-level options.
 *
 * Form options control form-wide behavior including button disabled states.
 * Used by button mappers to determine default disabled behavior.
 *
 * Like DEFAULT_PROPS, this token is provided ONCE at the DynamicForm level
 * and inherited by all children via Angular's hierarchical injector.
 *
 * The token provides a Signal to enable reactivity - when config changes, mappers
 * that read the signal inside their computed() will automatically update.
 *
 * @example
 * ```typescript
 * // In a button mapper
 * const formOptionsSignal = inject(FORM_OPTIONS);
 *
 * return computed(() => {
 *   const formOptions = formOptionsSignal?.();  // Read inside computed for reactivity
 *   const disableWhenInvalid = formOptions?.submitButton?.disableWhenInvalid ?? true;
 *   // ...
 * });
 * ```
 */
export const FORM_OPTIONS = new InjectionToken<Signal<FormOptions | undefined>>('FORM_OPTIONS');

/**
 * Injection token for form-level external data.
 *
 * Provides a Signal of the external data record from the form config.
 * Used by `FieldContextRegistryService` to resolve external data for expression evaluation
 * without coupling to `FormStateManager` directly.
 *
 * Like DEFAULT_PROPS, this token is provided ONCE at the DynamicForm level
 * and inherited by all children via Angular's hierarchical injector.
 */
export const EXTERNAL_DATA = new InjectionToken<Signal<Record<string, Signal<unknown>> | undefined>>('EXTERNAL_DATA');

/**
 * Injection token for array-level template registry.
 *
 * This registry tracks which template was used to create each array item,
 * keyed by the item's unique ID. This is essential for "recreate" operations
 * (e.g., after removing items from the middle) where we need to re-resolve
 * items using their original templates, not a fallback.
 *
 * The token is provided by ArrayFieldComponent at its level and shared
 * across all items in that array. Each nested array gets its own registry.
 *
 * @example
 * ```typescript
 * // In ArrayFieldComponent
 * providers: [
 *   { provide: ARRAY_TEMPLATE_REGISTRY, useValue: new Map() }
 * ]
 *
 * // When adding items
 * const registry = inject(ARRAY_TEMPLATE_REGISTRY);
 * registry.set(itemId, templates);
 *
 * // During recreate, look up original template
 * const originalTemplate = registry.get(existingItemId);
 * ```
 */
export const ARRAY_TEMPLATE_REGISTRY = new InjectionToken<ArrayTemplateRegistry>('ARRAY_TEMPLATE_REGISTRY');

/**
 * Registry type for storing templates used to create array items.
 * Key is the item's unique ID, value is the template (array of field definitions).
 */
export type ArrayTemplateRegistry = Map<string, import('../definitions/base/field-def').FieldDef<unknown>[]>;

/**
 * Injection token for array-level item ID generator.
 *
 * Provides a function that generates unique IDs for array items. Each array
 * component instance gets its own generator (via useFactory), ensuring:
 * - SSR hydration compatibility (server and client generate same IDs for same array)
 * - No global state pollution between form instances
 * - Deterministic IDs within each array's lifecycle
 *
 * The token is provided by ArrayFieldComponent at its level with a factory
 * that creates a fresh counter for each array instance.
 *
 * @example
 * ```typescript
 * // In ArrayFieldComponent
 * providers: [
 *   { provide: ARRAY_ITEM_ID_GENERATOR, useFactory: createArrayItemIdGenerator }
 * ]
 *
 * // Usage
 * const generateId = inject(ARRAY_ITEM_ID_GENERATOR);
 * const itemId = generateId(); // 'item-0', 'item-1', etc.
 * ```
 */
export const ARRAY_ITEM_ID_GENERATOR = new InjectionToken<() => string>('ARRAY_ITEM_ID_GENERATOR');

/**
 * Factory function that creates a new array item ID generator.
 * Each invocation creates an independent counter starting at 0.
 */
export function createArrayItemIdGenerator(): () => string {
  let counter = 0;
  return () => `item-${counter++}`;
}
