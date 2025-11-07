import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../../app/components/example-iframe';

@Component({
  selector: 'radio-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="radio" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioIframeDemoComponent {
  code = `{
  key: 'gender',
  type: 'radio',
  label: 'Gender',
  required: true,
  options: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ],
}`;
}
