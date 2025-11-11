import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { RowFieldIframeDemoComponent } from './row-field-iframe-demo.component';

const RowFieldExamplePage: NgDocPage = {
  title: 'Row Field',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 7,
  demos: {
    RowFieldDemoComponent: RowFieldIframeDemoComponent,
  },
};

export default RowFieldExamplePage;
