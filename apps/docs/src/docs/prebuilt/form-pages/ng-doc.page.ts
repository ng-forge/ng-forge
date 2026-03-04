import { NgDocPage } from '@ng-doc/core';
import LayoutComponentsCategory from '../ng-doc.category';
import InstallationPage from '../../installation/ng-doc.page';
import FormGroupsPage from '../form-groups/ng-doc.page';
import FormRowsPage from '../form-rows/ng-doc.page';
import FormArraysCompletePage from '../form-arrays/complete/ng-doc.page';

const FormPagesPage: NgDocPage = {
  title: 'Form Pages',
  mdFile: './index.md',
  category: LayoutComponentsCategory,
  order: 3,
  prerequisites: [InstallationPage],
  related: [FormGroupsPage, FormRowsPage, FormArraysCompletePage],
};

export default FormPagesPage;
