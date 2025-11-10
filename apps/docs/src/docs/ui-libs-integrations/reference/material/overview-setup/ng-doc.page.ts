import { NgDocPage } from '@ng-doc/core';
import UiLibsIntegrationCategory from '../../../ng-doc.category';
import { CompleteFormIframeDemoComponent } from './examples/complete-form-iframe-demo.component';

const MaterialOverviewPage: NgDocPage = {
  title: 'Material Design',
  mdFile: './index.md',
  category: UiLibsIntegrationCategory,
  order: 0,
  demos: {
    CompleteFormIframeDemoComponent,
  },
};

export default MaterialOverviewPage;
