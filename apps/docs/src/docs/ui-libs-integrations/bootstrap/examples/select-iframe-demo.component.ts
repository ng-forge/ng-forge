import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../../app/components/example-iframe';

@Component({
  selector: 'bootstrap-select-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="bootstrap" example="select" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectIframeDemoComponent {
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
