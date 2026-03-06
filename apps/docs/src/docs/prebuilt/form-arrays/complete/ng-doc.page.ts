import { NgDocPage } from '@ng-doc/core';
import FormArraysCategory from '../ng-doc.category';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';

const FormArraysCompletePage: NgDocPage = {
  title: 'Complete API',
  mdFile: './index.md',
  category: FormArraysCategory,
  order: 2,
  imports: [LiveExampleComponent],
};

export default FormArraysCompletePage;
