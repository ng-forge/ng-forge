import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-radio-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="radio" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioIframeDemoComponent {
  code = `{
  key: 'plan',
  type: 'radio',
  label: 'Choose your plan',
  value: '',
  required: true,
  options: [
    { label: 'Basic', value: 'basic' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise' },
  ],
  props: {
    inline: true,
    helpText: 'Select a subscription plan',
  },
}`;
}
