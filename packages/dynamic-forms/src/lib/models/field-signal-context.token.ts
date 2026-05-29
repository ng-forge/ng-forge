import { inject, InjectionToken, Signal } from '@angular/core';
import { DynamicFormError } from '../errors/dynamic-form-error';
import type { FieldSignalContext, ArrayContext, GroupContext } from '../mappers/types';
import type { WrapperConfig } from './wrapper-type';
import type { ValidationMessages } from './validation-types';
import type { FormOptions } from './form-config';

/** Injection token for form-level default wrappers. */
export const DEFAULT_WRAPPERS = new InjectionToken<Signal<readonly WrapperConfig[] | undefined>>('DEFAULT_WRAPPERS');

/** Injection token for providing field signal context to mappers and components. */
export const FIELD_SIGNAL_CONTEXT = new InjectionToken<FieldSignalContext>('FIELD_SIGNAL_CONTEXT');

/** Throwing accessor for {@link FIELD_SIGNAL_CONTEXT}. */
export function injectFieldSignalContext<TModel extends Record<string, unknown> = Record<string, unknown>>(): FieldSignalContext<TModel> {
  const ctx = inject(FIELD_SIGNAL_CONTEXT, { optional: true });
  if (!ctx) {
    throw new DynamicFormError('FIELD_SIGNAL_CONTEXT is not provided. This consumer must run inside a <df-dynamic-form> component tree.');
  }
  return ctx as FieldSignalContext<TModel>;
}

/** Injection token for providing array context metadata to mappers and components. */
export const ARRAY_CONTEXT = new InjectionToken<ArrayContext>('ARRAY_CONTEXT');

/** Injection token for providing group ancestry to mappers and components. */
// No factory: GROUP_CONTEXT is optional-by-design — `GroupFieldComponent` and
// `createArrayItemInjector` re-provide it where it makes sense, and consumers
// inject with `{ optional: true }` to handle the top-level case. Mirrors the
// ARRAY_CONTEXT pattern. Adding a throwing factory here fires even when
// injected optionally (Angular still evaluates the tree-shakable factory
// before honoring `optional`), so non-group fields would crash on every render.
export const GROUP_CONTEXT = new InjectionToken<GroupContext>('GROUP_CONTEXT');

/** Injection token for form-level default props. */
export const DEFAULT_PROPS = new InjectionToken<Signal<Record<string, unknown> | undefined>>('DEFAULT_PROPS');

/** Injection token for form-level default validation messages. */
export const DEFAULT_VALIDATION_MESSAGES = new InjectionToken<Signal<ValidationMessages | undefined>>('DEFAULT_VALIDATION_MESSAGES');

/** Injection token for form-level options. */
export const FORM_OPTIONS = new InjectionToken<Signal<FormOptions | undefined>>('FORM_OPTIONS');

/** Injection token for form-level external data. */
export const EXTERNAL_DATA = new InjectionToken<Signal<Record<string, Signal<unknown>> | undefined>>('EXTERNAL_DATA');

/**
 * Form-level DOM-id prefix, provided once at the DynamicForm level and read by
 * `mapFieldToInputs` as the outermost id segment: `{idPrefix}_{group}_{key}_{index}`.
 * Scopes ids to one form instance so duplicate forms on a page don't collide.
 * Inject `{ optional: true }` — absent under mock injectors / standalone usage.
 */
export const FORM_ID_PREFIX = new InjectionToken<Signal<string>>('FORM_ID_PREFIX');
