import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const LoginFormExamplePage: NgDocPage = {
  title: 'Login Form',
  mdFile: './index.md',
  route: 'examples/login-form',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default LoginFormExamplePage;
