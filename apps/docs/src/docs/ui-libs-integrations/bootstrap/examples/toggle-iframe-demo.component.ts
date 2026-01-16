import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-toggle-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="toggle" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleIframeDemoComponent {
  code = `{
  key: 'notifications',
  type: 'toggle',
  label: 'Enable notifications',
  value: true,
  props: {
    switch: true,
    hint: 'Receive updates about your account',
  },
}`;
}
