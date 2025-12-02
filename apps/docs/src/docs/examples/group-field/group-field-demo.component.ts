import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../app/components/remote-example';

@Component({
  selector: 'group-field-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="material" example="group" height="650px" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupFieldDemoComponent {
  code = `{
  fields: [
    { key: 'name', type: 'input', label: 'Full Name', value: '', required: true },
    { key: 'email', type: 'input', label: 'Email', value: '', required: true, email: true },
    // Group field: nests fields under 'address' object
    { key: 'address', type: 'group', label: 'Address',
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
