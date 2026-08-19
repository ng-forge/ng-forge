import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldErrorsWrapperBase, provideFieldErrorDisplay } from '@ng-forge/dynamic-forms/integration';

/**
 * Bootstrap rendering of a validation message for the wrapped field.
 * `d-block` is required — Bootstrap only reveals `.invalid-feedback` next to a
 * sibling `.is-invalid` control, which a container has none of.
 */
@Component({
  selector: 'df-bs-field-errors',
  template: `
    <ng-container #fieldComponent></ng-container>
    @if (ngf.errorsToDisplay()[0]; as error) {
      <div class="invalid-feedback d-block" role="alert" [id]="ngf.errorId()">{{ error.message }}</div>
    }
  `,
  styleUrl: './bs-field-errors-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideFieldErrorDisplay(() => BsFieldErrorsWrapperComponent)],
})
export default class BsFieldErrorsWrapperComponent extends FieldErrorsWrapperBase {}

export { BsFieldErrorsWrapperComponent };
