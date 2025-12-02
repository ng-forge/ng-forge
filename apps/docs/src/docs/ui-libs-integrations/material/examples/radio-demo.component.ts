import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'radio-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="material" example="radio" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioDemoComponent {
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
