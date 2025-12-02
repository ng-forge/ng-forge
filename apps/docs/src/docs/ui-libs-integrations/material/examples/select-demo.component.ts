import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'select-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="material" example="select" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDemoComponent {
  code = `{
  key: 'country',
  type: 'select',
  label: 'Country',
  required: true,
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
  ],
  props: {
    placeholder: 'Select your country',
  },
}`;
}
