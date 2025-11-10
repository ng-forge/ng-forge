import { NgDocPage } from '@ng-doc/core';
import UiLibsIntegrationCategory from '../../../../../../ng-doc.category';
import { InputIframeDemoComponent } from '../../../examples/input-iframe-demo.component';

const MaterialInputPage: NgDocPage = {
  title: 'Input',
  mdFile: './index.md',
  category: UiLibsIntegrationCategory,
  order: 10,
  demos: {
    InputIframeDemoComponent,
  },
};

export default MaterialInputPage;
