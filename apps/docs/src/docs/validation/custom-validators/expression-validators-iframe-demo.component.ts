import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'expression-validators-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="expression-validators-demo" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ExpressionValidatorsIframeDemoComponent {
  code = `{
  fields: [
    { key: 'password', type: 'input', label: 'Password', required: true, minLength: 8,
      props: { type: 'password' } },
    // Expression validator: validates password confirmation matches
    { key: 'confirmPassword', type: 'input', label: 'Confirm Password', required: true,
      validators: [
        { type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }
      ],
      validationMessages: { passwordMismatch: 'Passwords do not match' },
      props: { type: 'password' } },
    // Expression validator: ensures age is within valid range
    { key: 'age', type: 'input', label: 'Age', required: true,
      validators: [
        { type: 'custom', expression: 'fieldValue >= 18 && fieldValue <= 120', kind: 'ageRange' }
      ],
      validationMessages: { ageRange: 'Age must be between 18 and 120' },
      props: { type: 'number' } },
  ],
}`;
}
