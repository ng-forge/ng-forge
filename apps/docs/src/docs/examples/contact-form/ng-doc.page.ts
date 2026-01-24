import { NgDocPage } from '@ng-doc/core';
import { ContactFormIframeDemoComponent } from './contact-form-iframe-demo.component';

const ContactFormExamplePage: NgDocPage = {
  title: 'Contact Form',
  mdFile: './index.md',
  route: 'examples/contact-form',
  hidden: true,
  demos: {
    ContactFormDemoComponent: ContactFormIframeDemoComponent,
  },
};

export default ContactFormExamplePage;
