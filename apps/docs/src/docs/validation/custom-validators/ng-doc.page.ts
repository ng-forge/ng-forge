import { NgDocPage } from '@ng-doc/core';
import ValidationCategory from '../ng-doc.category';
import { CustomValidatorsIframeDemoComponent } from './custom-validators-iframe-demo.component';
import ExpressionValidatorsIframeDemoComponent from './expression-validators-iframe-demo.component';

const ValidationCustomValidatorsPage: NgDocPage = {
  title: 'Custom Validators',
  mdFile: './index.md',
  category: ValidationCategory,
  order: 4,
  demos: {
    CustomValidatorsDemoComponent: CustomValidatorsIframeDemoComponent,
    ExpressionValidatorsIframeDemoComponent: ExpressionValidatorsIframeDemoComponent,
  },
};

export default ValidationCustomValidatorsPage;
