import { NgDocPage } from '@ng-doc/core';
import LayoutComponentsCategory from '../ng-doc.category';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';
import InstallationPage from '../../installation/ng-doc.page';
import FormRowsPage from '../form-rows/ng-doc.page';
import FormPagesPage from '../form-pages/ng-doc.page';

const FormGroupsPage: NgDocPage = {
  title: 'Form Groups',
  mdFile: './index.md',
  category: LayoutComponentsCategory,
  order: 2,
  imports: [LiveExampleComponent],
  prerequisites: [InstallationPage],
  related: [FormRowsPage, FormPagesPage],
};

export default FormGroupsPage;
