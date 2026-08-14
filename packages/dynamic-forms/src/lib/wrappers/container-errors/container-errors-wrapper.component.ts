import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import { FieldWrapper, WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';
import { injectContainerErrors, ValidationMessages } from '@ng-forge/dynamic-forms/internal';

/**
 * Neutral default rendering of a container-level validation message.
 * Follows the `--df-error-*` conventions; adapters register their own under the same name.
 */
@Component({
  selector: 'df-container-errors-wrapper',
  template: `
    <ng-container #fieldComponent></ng-container>
    @for (error of errors(); track error.kind) {
      <div class="df-container-error" role="alert">{{ error.message }}</div>
    }
  `,
  styleUrl: './container-errors-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContainerErrorsWrapperComponent implements FieldWrapper {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  readonly validationMessages = input<ValidationMessages>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  protected readonly errors = injectContainerErrors({
    fieldInputs: this.fieldInputs,
    validationMessages: this.validationMessages,
  });
}

export { ContainerErrorsWrapperComponent };
