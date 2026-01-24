import { NgDocPage } from '@ng-doc/core';
import { BusinessAccountFormIframeDemoComponent } from './business-account-form-iframe-demo.component';

const BusinessAccountFormPage: NgDocPage = {
  title: 'Business Account Form',
  mdFile: './index.md',
  route: 'examples/business-account-form',
  hidden: true,
  demos: {
    BusinessAccountFormDemoComponent: BusinessAccountFormIframeDemoComponent,
  },
};

export default BusinessAccountFormPage;
