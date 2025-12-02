import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'input-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="ionic" example="input" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDemoComponent {
  code = `{
  key: 'email',
  type: 'input',
  label: 'Email Address',
  value: '',
  props: {
    type: 'email',
    placeholder: 'Enter your email',
  },
}`;
}
