import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'group-field-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="group" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupFieldIframeDemoComponent {
  code = `{
  fields: [
    { key: 'name', type: 'input', label: 'Full Name', value: '', required: true },
    { key: 'email', type: 'input', label: 'Email', value: '', required: true, email: true },
    // Text field for group heading
    { key: 'addressTitle', type: 'text', label: 'Address', props: { elementType: 'h4' } },
    // Group field: nests fields under 'address' object
    { key: 'address', type: 'group',
      fields: [
        { key: 'street', type: 'input', label: 'Street Address', value: '', required: true },
        { key: 'city', type: 'input', label: 'City', value: '', required: true },
        { key: 'state', type: 'input', label: 'State', value: '', required: true },
        { key: 'zip', type: 'input', label: 'ZIP Code', value: '', required: true, pattern: /^\\d{5}$/ }
      ]
    },
    // Result: { name: '', email: '', address: { street: '', city: '', state: '', zip: '' } }
    { type: 'submit', key: 'submit', label: 'Submit' },
  ],
}`;
}
