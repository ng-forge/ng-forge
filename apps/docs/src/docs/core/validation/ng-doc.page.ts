import { NgDocPage } from '@ng-doc/core';
import CoreCategory from '../ng-doc.category';
import { CustomValidatorsIframeDemoComponent } from './custom-validators-iframe-demo.component';

const ValidationPage: NgDocPage = {
  title: 'Validation',
  mdFile: ['./basics.md', './reference.md', './advanced.md', './custom-validators.md'],
  category: CoreCategory,
  order: 2,
  demos: {
    CustomValidatorsDemoComponent: CustomValidatorsIframeDemoComponent,
  },
};

export default ValidationPage;
