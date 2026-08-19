import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldErrorsWrapperBase, provideFieldErrorDisplay } from '@ng-forge/dynamic-forms/internal';

/**
 * Neutral default rendering of a validation message for the wrapped field.
 * Follows the `--df-error-*` conventions; adapters register their own under the same name.
 */
@Component({
  selector: 'df-field-errors-wrapper',
  template: `
    <ng-container #fieldComponent></ng-container>
    @if (ngf.errorsToDisplay()[0]; as error) {
      <div class="df-field-error" role="alert" [id]="ngf.errorId()">{{ error.message }}</div>
    }
  `,
  styleUrl: './field-errors-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideFieldErrorDisplay(() => FieldErrorsWrapperComponent)],
})
export default class FieldErrorsWrapperComponent extends FieldErrorsWrapperBase {}

export { FieldErrorsWrapperComponent };
