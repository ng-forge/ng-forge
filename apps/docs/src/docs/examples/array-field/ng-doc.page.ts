import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { ArrayFieldIframeDemoComponent } from './array-field-iframe-demo.component';

const ArrayFieldExamplePage: NgDocPage = {
  title: 'Array Field',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 5,
  demos: {
    ArrayFieldDemoComponent: ArrayFieldIframeDemoComponent,
  },
};

export default ArrayFieldExamplePage;
