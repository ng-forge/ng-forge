import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import { ValidationMessages } from '@ng-forge/dynamic-forms';
import { FieldWrapper, injectContainerErrors, WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';

/** PrimeNG rendering of a container-level validation message. Replaces the core default. */
@Component({
  selector: 'df-prime-container-errors',
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of errors(); track error.kind) {
      <small class="p-error" role="alert">{{ error.message }}</small>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PrimeContainerErrorsWrapperComponent implements FieldWrapper {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  readonly validationMessages = input<ValidationMessages>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  protected readonly errors = injectContainerErrors({
    fieldInputs: this.fieldInputs,
    validationMessages: this.validationMessages,
  });
}

export { PrimeContainerErrorsWrapperComponent };
