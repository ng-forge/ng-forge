import { NgDocPage } from '@ng-doc/core';
import LayoutComponentsCategory from '../ng-doc.category';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const FormGroupsPage: NgDocPage = {
  title: 'Form Groups',
  mdFile: './index.md',
  category: LayoutComponentsCategory,
  order: 2,
  imports: [LiveExampleComponent],
};

export default FormGroupsPage;
