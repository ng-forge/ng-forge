import { NgDocPage } from '@ng-doc/core';
import { LoginFormIframeDemoComponent } from './login-form-iframe-demo.component';

const LoginFormExamplePage: NgDocPage = {
  title: 'Login Form',
  mdFile: './index.md',
  route: 'examples/login-form',
  hidden: true,
  demos: {
    LoginFormDemoComponent: LoginFormIframeDemoComponent,
  },
};

export default LoginFormExamplePage;
