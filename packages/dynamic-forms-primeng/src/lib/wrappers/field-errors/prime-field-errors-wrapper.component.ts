import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldErrorsWrapperBase, provideFieldErrorDisplay } from '@ng-forge/dynamic-forms/integration';

/** PrimeNG rendering of a validation message for the wrapped field. Replaces the core default. */
@Component({
  selector: 'df-prime-field-errors',
  template: `
    <ng-container #fieldComponent></ng-container>
    @if (ngf.errorsToDisplay()[0]; as error) {
      <small class="p-error" role="alert" [id]="ngf.errorId()">{{ error.message }}</small>
    }
  `,
  styleUrl: './prime-field-errors-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideFieldErrorDisplay(() => PrimeFieldErrorsWrapperComponent)],
})
export default class PrimeFieldErrorsWrapperComponent extends FieldErrorsWrapperBase {}

export { PrimeFieldErrorsWrapperComponent };
