import { inject, InjectionToken, Signal } from '@angular/core';
import { DynamicFormError } from '../errors/dynamic-form-error';
import type { FieldSignalContext, ArrayContext, GroupContext } from '../mappers/types';
import type { WrapperConfig } from './wrapper-type';
import type { ValidationMessages } from './validation-types';
import type { FormOptions } from './form-config';

/**
 * Injection token for form-level default wrappers.
 *
 * Provides a Signal of the `defaultWrappers` array from FormConfig. Consumed by
 * `DfFieldOutlet` / `ContainerFieldComponent` to merge into each field's
 * effective wrapper chain (lowest priority after auto-associations, higher
 * than field-level `wrappers`).
 *
 * Provided once at the DynamicForm level and inherited via Angular's
 * hierarchical injector.
 */
export const DEFAULT_WRAPPERS = new InjectionToken<Signal<readonly WrapperConfig[] | undefined>>('DEFAULT_WRAPPERS');

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
export const FIELD_SIGNAL_CONTEXT = new InjectionToken<FieldSignalContext>('FIELD_SIGNAL_CONTEXT');

/**
 * Throwing accessor for {@link FIELD_SIGNAL_CONTEXT}.
 *
 * Use when the consumer requires the context — group/array containers and
 * mappers that depend on form structure. Throws a descriptive
 * `DynamicFormError` instead of Angular's generic `NullInjectorError` when
 * the token isn't provided.
 *
 * Consumers that may legitimately run outside a `DynamicForm` should keep
 * using `inject(FIELD_SIGNAL_CONTEXT, { optional: true })`.
 */
export function injectFieldSignalContext<TModel extends Record<string, unknown> = Record<string, unknown>>(): FieldSignalContext<TModel> {
  const ctx = inject(FIELD_SIGNAL_CONTEXT, { optional: true });
  if (!ctx) {
    throw new DynamicFormError('FIELD_SIGNAL_CONTEXT is not provided. This consumer must run inside a <df-dynamic-form> component tree.');
  }
  return ctx as FieldSignalContext<TModel>;
}

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
 * Injection token for providing group ancestry to mappers and components.
 *
 * Re-provided in two places:
 * 1. `GroupFieldComponent` provides a context whose `groupPath()` is the
 *    parent path extended by its own key (e.g. `'address'` or `'user.address'`).
 * 2. `createArrayItemInjector` provides a sentinel with an empty `groupPath`,
 *    resetting the chain at array boundaries — descendants of an array item
 *    that re-enter a group compose paths INSIDE the array item, matching the
 *    property-derivation collector's keying.
 *
 * `mapFieldToInputs` reads this to scope DOM IDs and override-store keys so
 * the same leaf key can appear in different groups without colliding (#401).
 *
 * Inject with `{ optional: true }` because top-level fields with no group
 * ancestor (and no enclosing array) won't have the token provided. The token
 * IS present for fields inside an array even when no inner group exists — the
 * array-boundary sentinel makes injection succeed with an empty `groupPath`.
 */
// No factory: GROUP_CONTEXT is optional-by-design — `GroupFieldComponent` and
// `createArrayItemInjector` re-provide it where it makes sense, and consumers
// inject with `{ optional: true }` to handle the top-level case. Mirrors the
// ARRAY_CONTEXT pattern. Adding a throwing factory here fires even when
// injected optionally (Angular still evaluates the tree-shakable factory
// before honoring `optional`), so non-group fields would crash on every render.
export const GROUP_CONTEXT = new InjectionToken<GroupContext>('GROUP_CONTEXT');

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
