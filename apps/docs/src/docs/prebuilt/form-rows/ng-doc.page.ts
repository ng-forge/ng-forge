import { NgDocPage } from '@ng-doc/core';
import PrebuiltCategory from '../ng-doc.category';
import { RowFieldIframeDemoComponent } from '../../examples/row-field/row-field-iframe-demo.component';

const FormRowsPage: NgDocPage = {
  title: 'Form Rows',
  mdFile: './index.md',
  category: PrebuiltCategory,
  order: 1,
  demos: {
    RowFieldDemoComponent: RowFieldIframeDemoComponent,
  },
};

export default FormRowsPage;
