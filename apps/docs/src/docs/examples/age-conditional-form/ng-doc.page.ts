import { NgDocPage } from '@ng-doc/core';
import { AgeConditionalFormIframeDemoComponent } from './age-conditional-form-iframe-demo.component';

const AgeConditionalFormPage: NgDocPage = {
  title: 'Age-Based Form',
  mdFile: './index.md',
  route: 'examples/age-conditional-form',
  hidden: true,
  demos: {
    AgeConditionalFormDemoComponent: AgeConditionalFormIframeDemoComponent,
  },
};

export default AgeConditionalFormPage;
