import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'input-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="input" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputIframeDemoComponent {
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
  },
}`;
}
