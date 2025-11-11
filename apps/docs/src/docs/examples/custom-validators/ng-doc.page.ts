import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { CustomValidatorsIframeDemoComponent } from './custom-validators-iframe-demo.component';

const CustomValidatorsExamplePage: NgDocPage = {
  title: 'Custom Validators',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 6,
  demos: {
    CustomValidatorsDemoComponent: CustomValidatorsIframeDemoComponent,
  },
};

export default CustomValidatorsExamplePage;
