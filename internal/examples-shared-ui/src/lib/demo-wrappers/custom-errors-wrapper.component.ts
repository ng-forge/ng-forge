import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldErrorsWrapperBase, provideFieldErrorDisplay } from '@ng-forge/dynamic-forms/integration';

/**
 * Demo error wrapper registered under its own name rather than replacing `field-errors`.
 *
 * Exists to exercise `rendersFieldErrors` end-to-end: a container carrying this wrapper
 * must not also get the built-in appended, or the message would render twice.
 */
@Component({
  selector: 'demo-custom-errors-wrapper',
  template: `
    <ng-container #fieldComponent></ng-container>
    @if (ngf.errorsToDisplay()[0]; as error) {
      <p class="demo-custom-error" role="alert" [id]="ngf.errorId()">{{ error.message }}</p>
    }
  `,
  styles: `
    .demo-custom-error {
      margin: 0.25rem 0 0;
      color: #b00020;
      font-size: 0.75rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideFieldErrorDisplay(() => CustomErrorsWrapperComponent)],
})
export default class CustomErrorsWrapperComponent extends FieldErrorsWrapperBase {}

export { CustomErrorsWrapperComponent };

/** Config shape for the `custom-errors` demo wrapper. */
export interface CustomErrorsWrapper {
  readonly type: 'custom-errors';
}

declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryWrappers {
    'custom-errors': CustomErrorsWrapper;
  }
}
