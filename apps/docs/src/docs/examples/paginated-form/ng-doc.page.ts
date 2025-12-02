import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { PaginatedFormDemoComponent } from './paginated-form-demo.component';

const PaginatedFormExamplePage: NgDocPage = {
  title: 'Paginated Form (Multi-Step)',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 4,
  demos: {
    PaginatedFormDemoComponent: PaginatedFormDemoComponent,
  },
};

export default PaginatedFormExamplePage;
