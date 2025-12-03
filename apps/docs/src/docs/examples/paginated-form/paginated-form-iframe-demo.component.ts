import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'paginated-form-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="paginated-form" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatedFormIframeDemoComponent {
  code = `{
  fields: [
    // Page 1: Personal Info
    { key: 'page1', type: 'page',
      fields: [
        { key: 'firstName', type: 'input', label: 'First Name', value: '', required: true },
        { key: 'lastName', type: 'input', label: 'Last Name', value: '', required: true },
        { key: 'email', type: 'input', label: 'Email', value: '', required: true, email: true },
        { type: 'next', key: 'next1', label: 'Continue' }
      ]
    },
    // Page 2: Address
    { key: 'page2', type: 'page',
      fields: [
        { key: 'street', type: 'input', label: 'Street', value: '', required: true },
        { key: 'city', type: 'input', label: 'City', value: '', required: true },
        { type: 'previous', key: 'prev2', label: 'Back' },
        { type: 'next', key: 'next2', label: 'Continue' }
      ]
    },
    // Page 3: Review & Submit
    { key: 'page3', type: 'page',
      fields: [
        { type: 'previous', key: 'prev3', label: 'Back' },
        { type: 'submit', key: 'submit', label: 'Submit' }
      ]
    },
  ],
}`;
}
