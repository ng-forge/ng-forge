import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'checkbox-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxIframeDemoComponent {
  code = `{
  key: 'terms',
  type: 'checkbox',
  label: 'I agree to the terms and conditions',
  required: true,
}`;
}
