import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const ArrayFormExamplePage: NgDocPage = {
  title: 'Array Form (Complete)',
  mdFile: './index.md',
  route: 'examples/array-form',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default ArrayFormExamplePage;
