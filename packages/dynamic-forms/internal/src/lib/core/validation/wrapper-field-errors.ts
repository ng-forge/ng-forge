import { computed, inject, Injector, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';
import { ValidationMessages } from '../../models/validation-types';
import { DEFAULT_VALIDATION_MESSAGES } from '../../models/field-signal-context.token';
import { createResolvedErrorsSignal, ResolvedError } from './create-resolved-errors-signal';
import { shouldShowErrors } from './should-show-errors';

/** The error surface a wrapper gets, mirroring the members `NgForgeField` exposes to field components. */
export interface WrapperFieldErrors {
  /** Every resolved error on the field, regardless of whether it should be shown yet. */
  readonly errors: Signal<ResolvedError[]>;
  /** Whether errors are ready to show — invalid, touched, and non-empty. */
  readonly showErrors: Signal<boolean>;
  /** `errors()` gated by `showErrors()`. This is what a template should render. */
  readonly errorsToDisplay: Signal<ResolvedError[]>;
  /** `{key}-error`, for wiring `aria-describedby` on the wrapped control. */
  readonly errorId: Signal<string>;
}

export interface WrapperFieldErrorsOptions {
  /** The wrapper's `fieldInputs` input. */
  readonly fieldInputs: Signal<WrapperFieldInputs | undefined>;
  /** Overrides the messages in `fieldInputs`. Rarely needed. */
  readonly validationMessages?: Signal<ValidationMessages | undefined>;
  /** Defaults to the current injection context. */
  readonly injector?: Injector;
}

/**
 * Resolves the wrapped field's errors for a wrapper component.
 *
 * A wrapper cannot `inject(NgForgeField)` — the wrapper chain is built before the field
 * component it wraps exists — so this reads the same information out of the `fieldInputs`
 * bag the wrapper already receives. Use it to build a shared form-field wrapper (label +
 * control + error/hint) without reimplementing message resolution.
 *
 * ```typescript
 * export default class FormFieldWrapper implements FieldWrapper {
 *   readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
 *   readonly fieldInputs = input<WrapperFieldInputs>();
 *   protected readonly ngf = injectFieldErrors({ fieldInputs: this.fieldInputs });
 * }
 * ```
 *
 * Must be called in an injection context.
 */
export function injectFieldErrors(options: WrapperFieldErrorsOptions): WrapperFieldErrors {
  const injector = options.injector ?? inject(Injector);
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES, { optional: true });

  // `field` is absent until the field is bound to the form — renders nothing until then.
  const fieldTree = computed<FieldTree<unknown> | undefined>(() => options.fieldInputs()?.field as FieldTree<unknown> | undefined);
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
