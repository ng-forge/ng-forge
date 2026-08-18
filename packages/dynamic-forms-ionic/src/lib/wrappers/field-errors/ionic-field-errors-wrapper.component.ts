import { computed, forwardRef, input, viewChild, ChangeDetectionStrategy, Component, ViewContainerRef } from '@angular/core';
import { IonNote } from '@ionic/angular/standalone';
import { ValidationMessages } from '@ng-forge/dynamic-forms';
import { FIELD_ERROR_DISPLAY, FieldWrapper, injectFieldErrors, WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';

/** Ionic rendering of a container-level validation message. Replaces the core default. */
@Component({
  selector: 'df-ion-field-errors',
  imports: [IonNote],
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of ngf.errorsToDisplay(); track error.kind) {
      <ion-note color="danger" class="df-ion-error" role="alert" [id]="ngf.errorId()">{{ error.message }}</ion-note>
    }
  `,
  styleUrl: './ionic-field-errors-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Claims error display for the field it wraps, so that field renders none of its own.
  providers: [{ provide: FIELD_ERROR_DISPLAY, useExisting: forwardRef(() => IonicFieldErrorsWrapperComponent) }],
})
export default class IonicFieldErrorsWrapperComponent implements FieldWrapper {
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

export { IonicFieldErrorsWrapperComponent };
