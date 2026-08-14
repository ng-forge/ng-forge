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
 * Resolves the display-ready errors for a container-level validator, for use by
 * a `container-errors` wrapper.
 *
 * A container (`group` / `array`) has no adapter field component to render its
 * message, so the wrapper resolves the container's own `FieldTree` itself. The
 * wrapper chain is created with the field-level injector, so
 * `FIELD_SIGNAL_CONTEXT` here is the container's PARENT tree and
 * `form[key]` is the container's own node — the same lookup
 * `GroupFieldComponent` performs.
 *
 * Adapter authors overriding the built-in `container-errors` wrapper should use
 * this rather than reimplementing the lookup:
 *
 * ```typescript
 * @Component({
 *   template: `
 *     <ng-container #fieldComponent></ng-container>
 *     @for (error of errors(); track error.kind) {
 *       <mat-error>{{ error.message }}</mat-error>
 *     }
 *   `,
 * })
 * export default class MatContainerErrorsWrapper implements FieldWrapper {
 *   readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
 *   readonly fieldInputs = input<WrapperFieldInputs>();
 *   readonly validationMessages = input<ValidationMessages>();
 *   protected readonly errors = injectContainerErrors({
 *     fieldInputs: this.fieldInputs,
 *     validationMessages: this.validationMessages,
 *   });
 * }
 * ```
 *
 * Must be called in an injection context (field initializer or constructor).
 */
export function injectContainerErrors(options: ContainerErrorsOptions): Signal<ResolvedError[]> {
  const injector = options.injector ?? inject(Injector);
  const fieldSignalContext = injectFieldSignalContext();
  const defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES, { optional: true });

  // `undefined` before the form settles, which simply renders nothing.
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
