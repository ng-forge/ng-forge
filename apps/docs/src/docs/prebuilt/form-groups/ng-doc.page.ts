import { NgDocPage } from '@ng-doc/core';
import LayoutComponentsCategory from '../ng-doc.category';
import { GroupFieldIframeDemoComponent } from '../../examples/group-field/group-field-iframe-demo.component';

const FormGroupsPage: NgDocPage = {
  title: 'Form Groups',
  mdFile: './index.md',
  category: LayoutComponentsCategory,
  order: 2,
  demos: {
    GroupFieldDemoComponent: GroupFieldIframeDemoComponent,
  },
};

export default FormGroupsPage;
