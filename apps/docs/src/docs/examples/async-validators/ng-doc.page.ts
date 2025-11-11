import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { AsyncValidatorsIframeDemoComponent } from './async-validators-iframe-demo.component';

const AsyncValidatorsExamplePage: NgDocPage = {
  title: 'Async & HTTP Validators',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 6,
  demos: {
    AsyncValidatorsDemoComponent: AsyncValidatorsIframeDemoComponent,
  },
};

export default AsyncValidatorsExamplePage;
