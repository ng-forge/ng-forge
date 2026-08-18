import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatError } from '@angular/material/form-field';
import { FieldErrorsWrapperBase, provideFieldErrorDisplay } from '@ng-forge/dynamic-forms/integration';

/** Material rendering of a validation message for the wrapped field. Replaces the core default. */
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
  providers: [provideFieldErrorDisplay(() => MatFieldErrorsWrapperComponent)],
})
export default class MatFieldErrorsWrapperComponent extends FieldErrorsWrapperBase {}

export { MatFieldErrorsWrapperComponent };
