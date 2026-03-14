import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const ContactDynamicFieldsPage: NgDocPage = {
  title: 'Dynamic Contact Fields',
  mdFile: './index.md',
  route: 'examples/contact-dynamic-fields',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default ContactDynamicFieldsPage;
