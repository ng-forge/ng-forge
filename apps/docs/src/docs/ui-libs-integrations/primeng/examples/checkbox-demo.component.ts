import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'checkbox-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="primeng" example="checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDemoComponent {
  code = `{
  key: 'newsletter',
  type: 'checkbox',
  label: 'Subscribe to newsletter',
  value: false,
  props: {
    hint: 'Get updates about new features',
  },
}`;
}
