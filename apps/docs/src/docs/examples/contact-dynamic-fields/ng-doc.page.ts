import { NgDocPage } from '@ng-doc/core';
import { ContactDynamicFieldsIframeDemoComponent } from './contact-dynamic-fields-iframe-demo.component';

const ContactDynamicFieldsPage: NgDocPage = {
  title: 'Dynamic Contact Fields',
  mdFile: './index.md',
  route: 'examples/contact-dynamic-fields',
  hidden: true,
  demos: {
    ContactDynamicFieldsDemoComponent: ContactDynamicFieldsIframeDemoComponent,
  },
};

export default ContactDynamicFieldsPage;
