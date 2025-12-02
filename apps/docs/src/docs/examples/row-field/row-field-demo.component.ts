import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RemoteExampleComponent } from '../../../app/components/remote-example';

@Component({
  selector: 'row-field-demo',
  imports: [RemoteExampleComponent],
  template: `<remote-example library="material" example="row" height="600px" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowFieldDemoComponent {
  code = `{
  fields: [
    // Row field: arranges fields horizontally
    { key: 'nameRow', type: 'row',
      fields: [
        { key: 'firstName', type: 'input', label: 'First Name', value: '', required: true, col: 6 },
        { key: 'lastName', type: 'input', label: 'Last Name', value: '', required: true, col: 6 }
      ]
    },
    { key: 'email', type: 'input', label: 'Email', value: '', required: true, email: true },
    { key: 'addressRow', type: 'row',
      fields: [
        { key: 'city', type: 'input', label: 'City', value: '', required: true, col: 6 },
        { key: 'state', type: 'input', label: 'State', value: '', required: true, col: 3 },
        { key: 'zip', type: 'input', label: 'ZIP', value: '', required: true, col: 3 }
      ]
    },
    // Result: { firstName: '', lastName: '', email: '', city: '', state: '', zip: '' }
    { type: 'submit', key: 'submit', label: 'Submit' },
  ],
}`;
}
