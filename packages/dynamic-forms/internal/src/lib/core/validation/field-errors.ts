import { computed, inject, Injector, InjectionToken, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';
import { ValidationMessages } from '../../models/validation-types';
import { DEFAULT_VALIDATION_MESSAGES, FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { createResolvedErrorsSignal, ResolvedError } from './create-resolved-errors-signal';
import { shouldShowErrors } from './should-show-errors';

/** A wrapper's claim to render errors, scoped to the one field key it wraps. */
export interface FieldErrorDisplayClaim {
  /** Key of the field whose errors this wrapper renders; `undefined` before inputs bind. */
  readonly claimedKey: Signal<string | undefined>;
}

/**
 * Marks that a wrapper is rendering a field's errors, so that field's component stops
 * rendering its own and the message appears once.
 *
 * The claim carries a key because a wrapper's providers reach every descendant: a wrapper
 * around an `array` would otherwise silence the errors of every input inside it. A field
 * suppresses its own rendering only when the claimed key is its own.
 *
 * Not `multi` — element injectors shadow rather than merge, so a nested claim would hide
 * the outer one regardless.
 */
export const FIELD_ERROR_DISPLAY = new InjectionToken<FieldErrorDisplayClaim>('FIELD_ERROR_DISPLAY');

/** The error surface a wrapper gets, mirroring what `NgForgeField` exposes to field components. */
export interface FieldErrors {
  /** Every resolved error, regardless of whether it should be shown yet. */
  readonly errors: Signal<ResolvedError[]>;
  /** Whether errors are ready to show — invalid, touched, and non-empty. */
  readonly showErrors: Signal<boolean>;
  /** `errors()` gated by `showErrors()`. This is what a template should render. */
  readonly errorsToDisplay: Signal<ResolvedError[]>;
  /** `{key}-error`, for wiring `aria-describedby` on the wrapped control. */
  readonly errorId: Signal<string>;
}

export interface FieldErrorsOptions {
  /** The wrapper's `fieldInputs` input. */
  readonly fieldInputs: Signal<WrapperFieldInputs | undefined>;
  /** Overrides the messages in `fieldInputs` — containers pass their own. */
  readonly validationMessages?: Signal<ValidationMessages | undefined>;
  /** Defaults to the current injection context. */
  readonly injector?: Injector;
}

/**
 * Resolves the wrapped field's errors for a wrapper component, for a leaf or a container.
 *
 * A wrapper cannot `inject(NgForgeField)` — the chain is built before the field component
 * exists — so this reads the same information out of the `fieldInputs` bag it already has.
 * A leaf carries its own `field`; a container has none, so its node is resolved by key
 * against the parent tree in `FIELD_SIGNAL_CONTEXT`.
 *
 * Must be called in an injection context.
 */
export function injectFieldErrors(options: FieldErrorsOptions): FieldErrors {
  const injector = options.injector ?? inject(Injector);
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES, { optional: true });
  const fieldSignalContext = inject(FIELD_SIGNAL_CONTEXT, { optional: true });

  const fieldTree = computed<FieldTree<unknown> | undefined>(() => {
    const inputs = options.fieldInputs();
    if (!inputs) return undefined;
    // Leaf: the mapper already put the tree in the bag. `ReadonlyFieldTree` is the same
    // callable narrowed to read-only signals, which is all the error signals touch.
    if (inputs.field) return inputs.field as unknown as FieldTree<unknown>;
    // Container: no `field`, so look its own node up in the parent tree.
    const parentTree = fieldSignalContext?.form as Record<string, FieldTree<unknown> | undefined> | undefined;
    return inputs.key ? parentTree?.[inputs.key] : undefined;
  });

  const messages = computed<ValidationMessages | undefined>(
    () => options.validationMessages?.() ?? (options.fieldInputs()?.validationMessages as ValidationMessages | undefined),
  );

  const errors = createResolvedErrorsSignal(
    fieldTree,
    messages,
    computed(() => defaultValidationMessages?.()),
    injector,
  );
  const showErrors = shouldShowErrors(fieldTree);

  return {
    errors,
    showErrors,
    errorsToDisplay: computed(() => (showErrors() ? errors() : [])),
    errorId: computed(() => `${options.fieldInputs()?.key ?? ''}-error`),
  };
}
