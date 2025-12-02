import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../../app/components/remote-example';

@Component({
  selector: 'bootstrap-select-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="bootstrap" example="select" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDemoComponent {
  code = `{
  key: 'country',
  type: 'select',
  label: 'Country',
  value: '',
  required: true,
  options: [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'United Kingdom', value: 'uk' },
  ],
  props: {
    placeholder: 'Select a country',
    floatingLabel: true,
    size: 'md',
    helpText: 'Choose your country of residence',
  },
}`;
}
