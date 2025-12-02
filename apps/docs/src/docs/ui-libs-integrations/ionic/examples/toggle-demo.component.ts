import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'toggle-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="ionic" example="toggle" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleDemoComponent {
  code = `{
  key: 'darkMode',
  type: 'toggle',
  label: 'Dark Mode',
  value: false,
  props: {
    labelPlacement: 'start',
  },
}`;
}
