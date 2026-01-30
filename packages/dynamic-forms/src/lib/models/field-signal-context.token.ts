import { InjectionToken, Signal } from '@angular/core';
import type { FieldSignalContext, ArrayContext } from '../mappers/types';
import type { ValidationMessages } from './validation-types';
import type { FormOptions } from './form-config';

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
    throw new Error(
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
 * Injection token for external data signals.
 *
 * External data provides a way to inject application state into form expressions.
 * Each property in the record is a Signal that gets unwrapped and made available
 * in the `EvaluationContext` under `externalData`.
 *
 * Like DEFAULT_PROPS, this token is provided ONCE at the DynamicForm level
 * and inherited by all children via Angular's hierarchical injector.
 *
 * The token provides a Signal containing the external data record, which itself
 * contains Signals. This allows the form to react to changes in which external
 * data is available (outer Signal) and to changes in the external data values
 * (inner Signals).
 *
 * @example
 * ```typescript
 * // In FieldContextRegistryService
 * const externalDataSignal = inject(EXTERNAL_DATA, { optional: true });
 *
 * // When creating evaluation context:
 * const externalDataRecord = externalDataSignal?.();
 * const resolvedExternalData = externalDataRecord
 *   ? Object.fromEntries(
 *       Object.entries(externalDataRecord).map(([k, v]) => [k, v()])
 *     )
 *   : {};
 * ```
 */
export const EXTERNAL_DATA = new InjectionToken<Signal<Record<string, Signal<unknown>> | undefined>>('EXTERNAL_DATA');
