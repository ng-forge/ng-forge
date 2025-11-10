import { NgDocPage } from '@ng-doc/core';
import MaterialCategory from '../ng-doc.category';
import { ButtonIframeDemoComponent } from '../examples/button-iframe-demo.component';

const ButtonsActionsPage: NgDocPage = {
  title: 'Buttons & Actions',
  mdFile: './index.md',
  category: MaterialCategory,
  order: 40,
  demos: {
    ButtonIframeDemoComponent,
  },
};

export default ButtonsActionsPage;
