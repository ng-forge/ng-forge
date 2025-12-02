import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'radio-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="ionic" example="radio" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioDemoComponent {
  code = `{
  key: 'subscriptionPlan',
  type: 'radio',
  label: 'Subscription Plan',
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
  ],
}`;
}
