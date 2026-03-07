import { NgDocPage } from '@ng-doc/core';
import LayoutComponentsCategory from '../ng-doc.category';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const FormRowsPage: NgDocPage = {
  title: 'Form Rows',
  mdFile: './index.md',
  category: LayoutComponentsCategory,
  order: 1,
  imports: [LiveExampleComponent],
};

export default FormRowsPage;
