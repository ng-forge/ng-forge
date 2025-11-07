import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'checkbox-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="ionic" example="checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxIframeDemoComponent {
  code = `{
  key: 'newsletter',
  type: 'checkbox',
  label: 'Subscribe to newsletter',
  value: false,
  props: {
    labelPlacement: 'end',
  },
}`;
}
