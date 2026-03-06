import { NgDocPage } from '@ng-doc/core';
import FormArraysCategory from '../ng-doc.category';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';

const FormArraysSimplifiedPage: NgDocPage = {
  title: 'Simplified API',
  mdFile: './index.md',
  category: FormArraysCategory,
  order: 1,
  imports: [LiveExampleComponent],
};

export default FormArraysSimplifiedPage;
