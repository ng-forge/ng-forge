import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { UserRegistrationDemoComponent } from './user-registration-demo.component';

const UserRegistrationExamplePage: NgDocPage = {
  title: 'User Registration Form',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 1,
  demos: {
    UserRegistrationDemoComponent: UserRegistrationDemoComponent,
  },
};

export default UserRegistrationExamplePage;
