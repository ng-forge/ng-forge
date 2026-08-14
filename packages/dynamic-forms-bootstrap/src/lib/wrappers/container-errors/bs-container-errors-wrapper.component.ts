import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import { ValidationMessages } from '@ng-forge/dynamic-forms';
import { FieldWrapper, injectContainerErrors, WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';

/**
 * Bootstrap rendering of a container-level validation message.
 *
 * Uses the same `.invalid-feedback.d-block` markup the Bootstrap field
 * components emit. `d-block` is required because Bootstrap only reveals
 * `.invalid-feedback` for a sibling `.is-invalid` control, which a container
 * does not have.
 */
@Component({
  selector: 'df-bs-container-errors',
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of errors(); track error.kind) {
      <div class="invalid-feedback d-block" role="alert">{{ error.message }}</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BsContainerErrorsWrapperComponent implements FieldWrapper {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  readonly validationMessages = input<ValidationMessages>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  protected readonly errors = injectContainerErrors({
    fieldInputs: this.fieldInputs,
    validationMessages: this.validationMessages,
  });
}

export { BsContainerErrorsWrapperComponent };
