import { NgDocPage } from '@ng-doc/core';
import FormArraysCategory from '../ng-doc.category';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';
import InstallationPage from '../../../installation/ng-doc.page';
import FormGroupsPage from '../../form-groups/ng-doc.page';
import FormPagesPage from '../../form-pages/ng-doc.page';

const FormArraysSimplifiedPage: NgDocPage = {
  title: 'Simplified API',
  mdFile: './index.md',
  category: FormArraysCategory,
  order: 1,
  imports: [LiveExampleComponent],
  prerequisites: [InstallationPage],
  related: [FormGroupsPage, FormPagesPage],
};

export default FormArraysSimplifiedPage;
