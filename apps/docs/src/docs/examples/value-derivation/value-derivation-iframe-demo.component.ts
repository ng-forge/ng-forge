import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'value-derivation-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="value-derivation" [code]="code" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueDerivationIframeDemoComponent {
  code = `{
  fields: [
    { key: 'calculationTitle', type: 'text', label: 'Order Calculator', props: { elementType: 'h3' } },
    { key: 'quantity', type: 'input', label: 'Quantity', value: 1, min: 1, props: { type: 'number' }, col: 4 },
    { key: 'unitPrice', type: 'input', label: 'Unit Price ($)', value: 25, props: { type: 'number' }, col: 4 },
    { key: 'subtotal', type: 'input', label: 'Subtotal ($)', props: { type: 'number' }, disabled: true, col: 4,
      derivation: 'formValue.quantity * formValue.unitPrice' },
    { key: 'taxRate', type: 'input', label: 'Tax Rate (%)', value: 10, props: { type: 'number' }, col: 4 },
    { key: 'tax', type: 'input', label: 'Tax ($)', props: { type: 'number' }, disabled: true, col: 4,
      derivation: 'formValue.subtotal * formValue.taxRate / 100' },
    { key: 'total', type: 'input', label: 'Total ($)', props: { type: 'number' }, disabled: true, col: 4,
      derivation: 'formValue.subtotal + formValue.tax' },
    { key: 'nameTitle', type: 'text', label: 'Name Concatenation', props: { elementType: 'h3' } },
    { key: 'firstName', type: 'input', label: 'First Name', value: 'John', col: 4 },
    { key: 'lastName', type: 'input', label: 'Last Name', value: 'Doe', col: 4 },
    { key: 'fullName', type: 'input', label: 'Full Name', disabled: true, col: 4,
      derivation: '(formValue.firstName || "") + " " + (formValue.lastName || "")' },
  ],
}`;
}
