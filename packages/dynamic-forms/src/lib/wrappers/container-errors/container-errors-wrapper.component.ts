import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, Signal, ViewContainerRef, viewChild } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FieldWrapper, WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';
import { createResolvedErrorsSignal, ResolvedError, shouldShowErrors } from '@ng-forge/dynamic-forms/internal';
import { DEFAULT_VALIDATION_MESSAGES, injectFieldSignalContext, ValidationMessages } from '@ng-forge/dynamic-forms/internal';

/**
 * Renders the errors raised by a container's own `validators` as text below the
 * container's content.
 *
 * Appended automatically to a `group` / `array` that declares `validators`.
 * Unlike a leaf field, a container has no adapter component to render its
 * message, so the wrapper resolves the container's `FieldTree` itself: the
 * wrapper chain is created with the field-level injector, so
 * `FIELD_SIGNAL_CONTEXT` here is the container's PARENT tree and `form[key]` is
 * the container's own node — the same lookup `GroupFieldComponent` does.
 */
@Component({
  selector: 'df-container-errors-wrapper',
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of errorsToDisplay(); track error.kind) {
      <div class="df-container-error" role="alert">{{ error.message }}</div>
    }
  `,
  styleUrl: './container-errors-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContainerErrorsWrapperComponent implements FieldWrapper {
  private readonly injector = inject(Injector);
  private readonly fieldSignalContext = injectFieldSignalContext();
  private readonly defaultValidationMessages = inject(DEFAULT_VALIDATION_MESSAGES, { optional: true });

  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  /** Forwarded from the wrapper config by the normalization pass. */
  readonly validationMessages = input<ValidationMessages>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  /**
   * The container's own node in the parent tree. `undefined` before the form
   * settles (or if the container has no schema path), which simply renders
   * nothing.
   */
  private readonly containerField = computed<FieldTree<unknown> | undefined>(() => {
    const key = this.fieldInputs()?.key;
    if (!key) return undefined;
    const parentTree = this.fieldSignalContext.form as Record<string, FieldTree<unknown> | undefined> | undefined;
    return parentTree?.[key];
  });

  private readonly resolvedErrors: Signal<ResolvedError[]> = createResolvedErrorsSignal(
    this.containerField,
    this.validationMessages,
    computed(() => this.defaultValidationMessages?.()),
    this.injector,
  );

  private readonly showErrors = shouldShowErrors(this.containerField);

  protected readonly errorsToDisplay = computed(() => (this.showErrors() ? this.resolvedErrors() : []));
}

export { ContainerErrorsWrapperComponent };
