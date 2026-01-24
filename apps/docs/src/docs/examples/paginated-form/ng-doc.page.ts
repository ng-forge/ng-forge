import { NgDocPage } from '@ng-doc/core';
import { PaginatedFormIframeDemoComponent } from './paginated-form-iframe-demo.component';

const PaginatedFormExamplePage: NgDocPage = {
  title: 'Paginated Form (Multi-Step)',
  mdFile: './index.md',
  route: 'examples/paginated-form',
  hidden: true,
  demos: {
    PaginatedFormDemoComponent: PaginatedFormIframeDemoComponent,
  },
};

export default PaginatedFormExamplePage;
