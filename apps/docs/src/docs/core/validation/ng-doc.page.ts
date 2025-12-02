import { NgDocPage } from '@ng-doc/core';
import CoreCategory from '../ng-doc.category';
import { CustomValidatorsDemoComponent } from './custom-validators-demo.component';
import ExpressionValidatorsDemoComponent from './expression-validators-demo.component';

const ValidationPage: NgDocPage = {
  title: 'Validation',
  mdFile: ['./basics.md', './reference.md', './advanced.md', './custom-validators.md'],
  category: CoreCategory,
  order: 2,
  demos: {
    CustomValidatorsDemoComponent: CustomValidatorsDemoComponent,
    ExpressionValidatorsDemoComponent: ExpressionValidatorsDemoComponent,
  },
};

export default ValidationPage;
