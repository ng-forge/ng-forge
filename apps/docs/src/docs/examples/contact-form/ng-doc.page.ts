import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { ContactFormDemoComponent } from './contact-form-demo.component';

const ContactFormExamplePage: NgDocPage = {
  title: 'Contact Form',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 2,
  demos: {
    ContactFormDemoComponent: ContactFormDemoComponent,
  },
};

export default ContactFormExamplePage;
