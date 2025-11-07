import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'radio-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="primeng" example="radio" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioIframeDemoComponent {
  code = `{
  key: 'subscriptionPlan',
  type: 'radio',
  label: 'Subscription Plan',
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
  ],
  props: {
    hint: 'Choose your plan',
  },
}`;
}
