import { NgDocPage } from '@ng-doc/core';
import { ExamplesIndexComponent } from '../../../app/pages/examples-index/examples-index.component';

const ExamplesIndexPage: NgDocPage = {
  title: 'Examples',
  mdFile: './index.md',
  route: 'examples',
  order: 3,
  demos: {
    ExamplesIndexComponent,
  },
};

export default ExamplesIndexPage;
