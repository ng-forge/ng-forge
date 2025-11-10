import { NgDocPage } from '@ng-doc/core';
import UiLibsIntegrationCategory from '../../../../../ng-doc.category';
import { ButtonIframeDemoComponent } from '../../../examples/button-iframe-demo.component';

const MaterialSubmitButtonPage: NgDocPage = {
  title: 'Submit Button',
  mdFile: './index.md',
  category: UiLibsIntegrationCategory,
  order: 40,
  demos: {
    ButtonIframeDemoComponent,
  },
};

export default MaterialSubmitButtonPage;
