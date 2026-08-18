import { computed, forwardRef, input, viewChild, ChangeDetectionStrategy, Component, ViewContainerRef } from '@angular/core';
import { MatError } from '@angular/material/form-field';
import { ValidationMessages } from '@ng-forge/dynamic-forms';
import { FIELD_ERROR_DISPLAY, FieldWrapper, injectFieldErrors, WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';

/** Material rendering of a container-level validation message. Replaces the core default. */
@Component({
  selector: 'df-mat-field-errors',
  imports: [MatError],
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of ngf.errorsToDisplay(); track error.kind) {
      <mat-error class="df-mat-field-error" role="alert" [id]="ngf.errorId()">{{ error.message }}</mat-error>
    }
  `,
  styleUrl: './mat-field-errors-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Claims error display for the field it wraps, so that field renders none of its own.
  providers: [{ provide: FIELD_ERROR_DISPLAY, useExisting: forwardRef(() => MatFieldErrorsWrapperComponent) }],
})
export default class MatFieldErrorsWrapperComponent implements FieldWrapper {
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

export { MatFieldErrorsWrapperComponent };
