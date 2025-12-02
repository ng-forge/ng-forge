import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-multi-checkbox-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="multi-checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiCheckboxDemoComponent {
  code = `{
  key: 'interests',
  type: 'multi-checkbox',
  label: 'Your interests',
  value: [],
  options: [
    { label: 'Sports', value: 'sports' },
    { label: 'Technology', value: 'tech' },
    { label: 'Music', value: 'music' },
    { label: 'Travel', value: 'travel' },
  ],
  props: {
    inline: false,
    helpText: 'Select all that apply',
  },
}`;
}
