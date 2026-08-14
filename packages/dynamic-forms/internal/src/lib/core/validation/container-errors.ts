import { computed, inject, Injector, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';
import { ValidationMessages } from '../../models/validation-types';
import { DEFAULT_VALIDATION_MESSAGES, injectFieldSignalContext } from '../../models/field-signal-context.token';
import { createResolvedErrorsSignal, ResolvedError } from './create-resolved-errors-signal';
import { shouldShowErrors } from './should-show-errors';

/** Inputs a `container-errors` wrapper receives from the wrapper pipeline. */
export interface ContainerErrorsOptions {
  /** The wrapper's `fieldInputs` input — supplies the container's `key`. */
  readonly fieldInputs: Signal<WrapperFieldInputs | undefined>;
  /** The wrapper's `validationMessages` input, forwarded from the container config. */
  readonly validationMessages: Signal<ValidationMessages | undefined>;
  /** Defaults to the current injection context. */
  readonly injector?: Injector;
}

/**
 * Resolves the display-ready errors for a `container-errors` wrapper.
 *
 * The wrapper chain is created with the field-level injector, so `FIELD_SIGNAL_CONTEXT`
 * here is the container's PARENT tree and `form[key]` is the container's own node.
 * Must be called in an injection context.
 */
export function injectContainerErrors(options: ContainerErrorsOptions): Signal<ResolvedError[]> {
  const injector = options.injector ?? inject(Injector);
  const fieldSignalContext = injectFieldSignalContext();
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES, { optional: true });

  // `undefined` before the form settles — renders nothing.
  const containerField = computed<FieldTree<unknown> | undefined>(() => {
    const key = options.fieldInputs()?.key;
    if (!key) return undefined;
    const parentTree = fieldSignalContext.form as Record<string, FieldTree<unknown> | undefined> | undefined;
    return parentTree?.[key];
  });

  const resolved = createResolvedErrorsSignal(
    containerField,
    options.validationMessages,
    computed(() => defaultValidationMessages?.()),
    injector,
  );
  const showErrors = shouldShowErrors(containerField);

  return computed(() => (showErrors() ? resolved() : []));
}
