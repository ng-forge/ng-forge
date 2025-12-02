import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'multi-checkbox-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="material" example="multi-checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiCheckboxDemoComponent {
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
