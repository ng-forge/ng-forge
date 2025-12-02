import { NgDocPage } from '@ng-doc/core';
import PrebuiltCategory from '../ng-doc.category';
import { ArrayFieldDemoComponent } from '../../examples/array-field/array-field-demo.component';

const FormArraysPage: NgDocPage = {
  title: 'Form Arrays',
  mdFile: './index.md',
  category: PrebuiltCategory,
  order: 3,
  demos: {
    ArrayFieldDemoComponent: ArrayFieldDemoComponent,
  },
};

export default FormArraysPage;
