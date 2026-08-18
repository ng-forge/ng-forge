import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonNote } from '@ionic/angular/standalone';
import { FieldErrorsWrapperBase, provideFieldErrorDisplay } from '@ng-forge/dynamic-forms/integration';

/** Ionic rendering of a validation message for the wrapped field. Replaces the core default. */
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
  providers: [provideFieldErrorDisplay(() => IonicFieldErrorsWrapperComponent)],
})
export default class IonicFieldErrorsWrapperComponent extends FieldErrorsWrapperBase {}

export { IonicFieldErrorsWrapperComponent };
