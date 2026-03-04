import { NgDocPage } from '@ng-doc/core';
import LayoutComponentsCategory from '../ng-doc.category';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';
import InstallationPage from '../../installation/ng-doc.page';
import FormGroupsPage from '../form-groups/ng-doc.page';

const FormRowsPage: NgDocPage = {
  title: 'Form Rows',
  mdFile: './index.md',
  category: LayoutComponentsCategory,
  order: 1,
  imports: [LiveExampleComponent],
  prerequisites: [InstallationPage],
  related: [FormGroupsPage],
};

export default FormRowsPage;
