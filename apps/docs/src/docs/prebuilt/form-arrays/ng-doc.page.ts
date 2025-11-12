import { NgDocPage } from '@ng-doc/core';
import PrebuiltCategory from '../ng-doc.category';
import { ArrayFieldIframeDemoComponent } from '../../examples/array-field/array-field-iframe-demo.component';

const FormArraysPage: NgDocPage = {
  title: 'Form Arrays',
  mdFile: './index.md',
  category: PrebuiltCategory,
  order: 3,
  demos: {
    ArrayFieldDemoComponent: ArrayFieldIframeDemoComponent,
  },
};

export default FormArraysPage;
