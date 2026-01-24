import { NgDocPage } from '@ng-doc/core';
import { ExamplesIndexComponent } from '../../../app/pages/examples-index/examples-index.component';

const ExamplesIndexPage: NgDocPage = {
  title: 'Quick Start',
  mdFile: './index.md',
  route: 'examples',
  order: 2,
  demos: {
    ExamplesIndexComponent,
  },
};

export default ExamplesIndexPage;
