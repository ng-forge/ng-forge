import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import { IonNote } from '@ionic/angular/standalone';
import { ValidationMessages } from '@ng-forge/dynamic-forms';
import { FieldWrapper, injectContainerErrors, WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';

/**
 * Ionic rendering of a container-level validation message.
 *
 * Uses the same `<ion-note color="danger" class="df-ion-error">` markup the
 * Ionic field components emit for field-level errors.
 */
@Component({
  selector: 'df-ion-container-errors',
  imports: [IonNote],
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of errors(); track error.kind) {
      <ion-note color="danger" class="df-ion-error" role="alert">{{ error.message }}</ion-note>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IonicContainerErrorsWrapperComponent implements FieldWrapper {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  readonly validationMessages = input<ValidationMessages>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  protected readonly errors = injectContainerErrors({
    fieldInputs: this.fieldInputs,
    validationMessages: this.validationMessages,
  });
}

export { IonicContainerErrorsWrapperComponent };
