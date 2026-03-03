import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const PaginatedFormExamplePage: NgDocPage = {
  title: 'Paginated Form (Multi-Step)',
  mdFile: './index.md',
  route: 'examples/paginated-form',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default PaginatedFormExamplePage;
