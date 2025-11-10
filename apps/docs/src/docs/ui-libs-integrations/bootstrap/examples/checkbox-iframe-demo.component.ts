import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-checkbox-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxIframeDemoComponent {
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
