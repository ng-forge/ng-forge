import { NgDocPage } from '@ng-doc/core';
import { ShippingBillingAddressIframeDemoComponent } from './shipping-billing-address-iframe-demo.component';

const ShippingBillingAddressPage: NgDocPage = {
  title: 'Shipping Same-as-Billing',
  mdFile: './index.md',
  route: 'examples/shipping-billing-address',
  hidden: true,
  demos: {
    ShippingBillingAddressDemoComponent: ShippingBillingAddressIframeDemoComponent,
  },
};

export default ShippingBillingAddressPage;
