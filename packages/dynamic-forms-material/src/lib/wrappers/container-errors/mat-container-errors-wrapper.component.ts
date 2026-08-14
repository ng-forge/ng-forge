import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import { MatError } from '@angular/material/form-field';
import { ValidationMessages } from '@ng-forge/dynamic-forms';
import { FieldWrapper, injectContainerErrors, WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';

/**
 * Material rendering of a container-level validation message.
 *
 * Registered under the built-in `container-errors` name, so it replaces the
 * neutral core default for apps using Material fields. Attached automatically
 * to a `group` / `array` that declares `validators`.
 */
@Component({
  selector: 'df-mat-container-errors',
  imports: [MatError],
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of errors(); track error.kind) {
      <mat-error class="df-mat-container-error" role="alert">{{ error.message }}</mat-error>
    }
  `,
  styleUrl: './mat-container-errors-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatContainerErrorsWrapperComponent implements FieldWrapper {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  readonly validationMessages = input<ValidationMessages>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  protected readonly errors = injectContainerErrors({
    fieldInputs: this.fieldInputs,
    validationMessages: this.validationMessages,
  });
}

export { MatContainerErrorsWrapperComponent };
