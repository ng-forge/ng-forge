import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-radio-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="radio" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioDemoComponent {
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
