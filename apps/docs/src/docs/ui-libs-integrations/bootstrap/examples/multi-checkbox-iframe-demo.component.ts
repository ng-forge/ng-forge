import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-multi-checkbox-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="multi-checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiCheckboxIframeDemoComponent {
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
