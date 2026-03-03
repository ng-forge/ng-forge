import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const ContactFormExamplePage: NgDocPage = {
  title: 'Contact Form',
  mdFile: './index.md',
  route: 'examples/contact-form',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default ContactFormExamplePage;
