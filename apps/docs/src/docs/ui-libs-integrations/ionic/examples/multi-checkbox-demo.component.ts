import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'multi-checkbox-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="ionic" example="multi-checkbox" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiCheckboxDemoComponent {
  code = `{
  key: 'interests',
  type: 'multi-checkbox',
  label: 'Interests',
  options: [
    { value: 'sports', label: 'Sports' },
    { value: 'music', label: 'Music' },
    { value: 'technology', label: 'Technology' },
    { value: 'art', label: 'Art' },
  ],
}`;
}
