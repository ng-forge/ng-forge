import { NgDocPage } from '@ng-doc/core';
import PrebuiltCategory from '../ng-doc.category';
import { GroupFieldDemoComponent } from '../../examples/group-field/group-field-demo.component';

const FormGroupsPage: NgDocPage = {
  title: 'Form Groups',
  mdFile: './index.md',
  category: PrebuiltCategory,
  order: 2,
  demos: {
    GroupFieldDemoComponent: GroupFieldDemoComponent,
  },
};

export default FormGroupsPage;
