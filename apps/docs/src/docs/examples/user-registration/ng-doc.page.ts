import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const UserRegistrationExamplePage: NgDocPage = {
  title: 'User Registration Form',
  mdFile: './index.md',
  route: 'examples/user-registration',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default UserRegistrationExamplePage;
