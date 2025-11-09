import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'multi-checkbox-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="multi-checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiCheckboxIframeDemoComponent {
  code = `{
  key: 'interests',
  type: 'multi-checkbox',
  label: 'Select Your Interests',
  required: true,
  options: [
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'reading', label: 'Reading' },
    { value: 'travel', label: 'Travel' },
    { value: 'cooking', label: 'Cooking' },
  ],
}`;
}
