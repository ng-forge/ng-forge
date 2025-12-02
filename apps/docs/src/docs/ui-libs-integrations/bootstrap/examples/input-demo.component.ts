import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-input-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="input" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDemoComponent {
  code = `{
  key: 'email',
  type: 'input',
  label: 'Email Address',
  value: '',
  required: true,
  email: true,
  props: {
    type: 'email',
    placeholder: 'Enter your email',
    floatingLabel: true,
    size: 'lg',
    helpText: 'We will never share your email',
  },
}`;
}
