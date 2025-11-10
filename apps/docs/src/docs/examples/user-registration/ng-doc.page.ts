import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { UserRegistrationIframeDemoComponent } from './user-registration-iframe-demo.component';

const UserRegistrationExamplePage: NgDocPage = {
  title: 'User Registration Form',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 1,
  demos: {
    UserRegistrationDemoComponent: UserRegistrationIframeDemoComponent,
  },
};

export default UserRegistrationExamplePage;
