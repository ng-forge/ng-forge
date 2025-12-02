import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-checkbox-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDemoComponent {
  code = `{
  key: 'terms',
  type: 'checkbox',
  label: 'I agree to the terms and conditions',
  value: false,
  required: true,
  props: {
    inline: false,
    helpText: 'Please read and accept our terms',
  },
}`;
}
