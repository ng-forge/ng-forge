import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { LoginFormDemoComponent } from './login-form-demo.component';

const LoginFormExamplePage: NgDocPage = {
  title: 'Login Form',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 3,
  demos: {
    LoginFormDemoComponent: LoginFormDemoComponent,
  },
};

export default LoginFormExamplePage;
