import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const BusinessAccountFormPage: NgDocPage = {
  title: 'Business Account Form',
  mdFile: './index.md',
  route: 'examples/business-account-form',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default BusinessAccountFormPage;
