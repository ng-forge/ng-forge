import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleIframeComponent } from '../../../app/components/example-iframe';

@Component({
  selector: 'shipping-billing-address-iframe-demo',
  imports: [ExampleIframeComponent],
  template: `<example-iframe library="material" example="shipping-billing-address" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingBillingAddressIframeDemoComponent {}
