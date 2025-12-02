import { NgDocPage } from '@ng-doc/core';
import PrebuiltCategory from '../ng-doc.category';
import { RowFieldDemoComponent } from '../../examples/row-field/row-field-demo.component';

const FormRowsPage: NgDocPage = {
  title: 'Form Rows',
  mdFile: './index.md',
  category: PrebuiltCategory,
  order: 1,
  demos: {
    RowFieldDemoComponent: RowFieldDemoComponent,
  },
};

export default FormRowsPage;
