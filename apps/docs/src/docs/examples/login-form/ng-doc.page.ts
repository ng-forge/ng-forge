import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { LoginFormIframeDemoComponent } from './login-form-iframe-demo.component';

const LoginFormExamplePage: NgDocPage = {
  title: 'Login Form',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 3,
  demos: {
    LoginFormDemoComponent: LoginFormIframeDemoComponent,
  },
};

export default LoginFormExamplePage;
