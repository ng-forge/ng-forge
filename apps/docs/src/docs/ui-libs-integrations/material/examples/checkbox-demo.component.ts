import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'checkbox-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="material" example="checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDemoComponent {
  code = `{
  key: 'terms',
  type: 'checkbox',
  label: 'I agree to the terms and conditions',
  required: true,
}`;
}
