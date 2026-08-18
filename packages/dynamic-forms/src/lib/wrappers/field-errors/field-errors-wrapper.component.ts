import { computed, forwardRef, input, viewChild, ChangeDetectionStrategy, Component, ViewContainerRef } from '@angular/core';
import { FieldWrapper, WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';
import { FIELD_ERROR_DISPLAY, injectFieldErrors, ValidationMessages } from '@ng-forge/dynamic-forms/internal';

/**
 * Neutral default rendering of a validation message for the wrapped field.
 * Follows the `--df-error-*` conventions; adapters register their own under the same name.
 */
@Component({
  selector: 'df-field-errors-wrapper',
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of ngf.errorsToDisplay(); track error.kind) {
      <div class="df-field-error" role="alert" [id]="ngf.errorId()">{{ error.message }}</div>
    }
  `,
  styleUrl: './field-errors-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Claims error display for the field it wraps, so that field renders none of its own.
  providers: [{ provide: FIELD_ERROR_DISPLAY, useExisting: forwardRef(() => FieldErrorsWrapperComponent) }],
})
export default class FieldErrorsWrapperComponent implements FieldWrapper {
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

export { FieldErrorsWrapperComponent };
