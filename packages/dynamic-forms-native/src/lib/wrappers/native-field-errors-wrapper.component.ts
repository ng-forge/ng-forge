import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldErrorsWrapperBase, provideFieldErrorDisplay } from '@ng-forge/dynamic-forms/integration';
import { Text } from '@ng-native/components';

/**
 * Replaces core's `field-errors` wrapper, which renders the message as text in a `<div>`. Text
 * only shows inside `<text>` on ng-native, so a container-level message would be invisible.
 */
@Component({
  selector: 'df-native-field-errors',
  imports: [Text],
  template: `
    <ng-container #fieldComponent></ng-container>
    @if (ngf.errorsToDisplay()[0]; as error) {
      <text class="error" role="alert" [testID]="ngf.errorId()">{{ error.message }}</text>
    }
  `,
  styleUrl: '../styles/field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideFieldErrorDisplay(() => NativeFieldErrorsWrapperComponent)],
})
export default class NativeFieldErrorsWrapperComponent extends FieldErrorsWrapperBase {}
export { NativeFieldErrorsWrapperComponent };
