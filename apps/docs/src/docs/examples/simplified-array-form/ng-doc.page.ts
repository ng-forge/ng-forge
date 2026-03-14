import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const SimplifiedArrayFormExamplePage: NgDocPage = {
  title: 'Simplified Array Form',
  mdFile: './index.md',
  route: 'examples/simplified-array-form',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default SimplifiedArrayFormExamplePage;
