import { computed, forwardRef, input, viewChild, ChangeDetectionStrategy, Component, ViewContainerRef } from '@angular/core';
import { ValidationMessages } from '@ng-forge/dynamic-forms';
import { FIELD_ERROR_DISPLAY, FieldWrapper, injectFieldErrors, WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';

/** PrimeNG rendering of a container-level validation message. Replaces the core default. */
@Component({
  selector: 'df-prime-field-errors',
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of ngf.errorsToDisplay(); track error.kind) {
      <small class="p-error" role="alert" [id]="ngf.errorId()">{{ error.message }}</small>
    }
  `,
  styleUrl: './prime-field-errors-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Claims error display for the field it wraps, so that field renders none of its own.
  providers: [{ provide: FIELD_ERROR_DISPLAY, useExisting: forwardRef(() => PrimeFieldErrorsWrapperComponent) }],
})
export default class PrimeFieldErrorsWrapperComponent implements FieldWrapper {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  readonly validationMessages = input<ValidationMessages>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  /** The field this wrapper renders errors for — see `FieldErrorDisplayClaim`. */
  readonly claimedKey = computed(() => this.fieldInputs()?.key);

  protected readonly ngf = injectFieldErrors({
    fieldInputs: this.fieldInputs,
    validationMessages: this.validationMessages,
  });
}

export { PrimeFieldErrorsWrapperComponent };
