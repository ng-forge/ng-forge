import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { ContactFormIframeDemoComponent } from './contact-form-iframe-demo.component';

const ContactFormExamplePage: NgDocPage = {
  title: 'Contact Form',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 2,
  demos: {
    ContactFormDemoComponent: ContactFormIframeDemoComponent,
  },
};

export default ContactFormExamplePage;
