import { NgDocPage } from '@ng-doc/core';
import MaterialCategory from '../ng-doc.category';
import { CompleteFormIframeDemoComponent } from '../examples/complete-form-iframe-demo.component';

const MaterialOverviewPage: NgDocPage = {
  title: 'Overview & Setup',
  mdFile: './index.md',
  category: MaterialCategory,
  order: 0,
  demos: {
    CompleteFormIframeDemoComponent,
  },
};

export default MaterialOverviewPage;
