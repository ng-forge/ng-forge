import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { GroupFieldIframeDemoComponent } from './group-field-iframe-demo.component';

const GroupFieldExamplePage: NgDocPage = {
  title: 'Group Field',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 6,
  demos: {
    GroupFieldDemoComponent: GroupFieldIframeDemoComponent,
  },
};

export default GroupFieldExamplePage;
