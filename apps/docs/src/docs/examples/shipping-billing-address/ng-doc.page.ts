import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const ShippingBillingAddressPage: NgDocPage = {
  title: 'Shipping Same-as-Billing',
  mdFile: './index.md',
  route: 'examples/shipping-billing-address',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default ShippingBillingAddressPage;
