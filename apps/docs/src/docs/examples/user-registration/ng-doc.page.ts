import { NgDocPage } from '@ng-doc/core';
import { UserRegistrationIframeDemoComponent } from './user-registration-iframe-demo.component';

const UserRegistrationExamplePage: NgDocPage = {
  title: 'User Registration Form',
  mdFile: './index.md',
  route: 'examples/user-registration',
  hidden: true,
  demos: {
    UserRegistrationDemoComponent: UserRegistrationIframeDemoComponent,
  },
};

export default UserRegistrationExamplePage;
