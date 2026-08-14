import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import { FieldWrapper, WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';
import { injectContainerErrors, ValidationMessages } from '@ng-forge/dynamic-forms/internal';

/**
 * Renders the errors raised by a container's own `validators` as text below the
 * container's content.
 *
 * Appended automatically to a `group` / `array` that declares `validators`.
 * This is the neutral default — it follows the `--df-error-*` conventions so it
 * matches field-level errors in any adapter. Adapters register their own
 * component under the same `container-errors` name to render a native error
 * element instead.
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

  /** Forwarded from the wrapper config by the normalization pass. */
  readonly validationMessages = input<ValidationMessages>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  protected readonly errors = injectContainerErrors({
    fieldInputs: this.fieldInputs,
    validationMessages: this.validationMessages,
  });
}

export { ContainerErrorsWrapperComponent };
