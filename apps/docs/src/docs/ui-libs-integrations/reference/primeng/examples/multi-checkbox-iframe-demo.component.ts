import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'multi-checkbox-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="primeng" example="multi-checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiCheckboxIframeDemoComponent {
  code = `{
  key: 'interests',
  type: 'multi-checkbox',
  label: 'Interests',
  props: {
    hint: 'Select all that apply',
    options: [
      { value: 'sports', label: 'Sports' },
      { value: 'music', label: 'Music' },
      { value: 'technology', label: 'Technology' },
      { value: 'art', label: 'Art' },
    ],
  },
}`;
}
