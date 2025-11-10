import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'toggle-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="ionic" example="toggle" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleIframeDemoComponent {
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
