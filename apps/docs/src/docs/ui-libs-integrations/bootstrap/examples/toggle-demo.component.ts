import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-toggle-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="toggle" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleDemoComponent {
  code = `{
  key: 'notifications',
  type: 'toggle',
  label: 'Enable notifications',
  value: true,
  props: {
    switch: true,
    helpText: 'Receive updates about your account',
  },
}`;
}
