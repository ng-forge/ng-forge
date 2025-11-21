import { NgDocPage } from '@ng-doc/core';
import PrebuiltCategory from '../ng-doc.category';
import { GroupFieldIframeDemoComponent } from '../../examples/group-field/group-field-iframe-demo.component';

const FormGroupsPage: NgDocPage = {
  title: 'Form Groups',
  mdFile: './index.md',
  category: PrebuiltCategory,
  order: 2,
  demos: {
    GroupFieldDemoComponent: GroupFieldIframeDemoComponent,
  },
};

export default FormGroupsPage;
