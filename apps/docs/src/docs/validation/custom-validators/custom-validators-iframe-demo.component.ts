import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'custom-validators-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="custom-validators" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomValidatorsIframeDemoComponent {
  code = `// Note: This demo requires registering custom validators
// See documentation for validator registration examples

{
  fields: [
    { key: 'username', type: 'input', label: 'Username', required: true,
      validators: [{ type: 'custom', name: 'usernameValidator' }],
      validationMessages: { usernameValidator: 'Username already exists' } },
    { key: 'email', type: 'input', label: 'Email', required: true, email: true,
      validators: [{ type: 'custom', name: 'emailDomainValidator' }],
      validationMessages: { emailDomainValidator: 'Only company email addresses are allowed' } },
  ],
}`;
}
