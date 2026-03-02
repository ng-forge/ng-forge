import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';
import FieldTypesCategory from '../ng-doc.category';

const TextInputsPage: NgDocPage = {
  title: 'Text Inputs',
  mdFile: './index.md',
  category: FieldTypesCategory,
  order: 1,
  imports: [LiveExampleComponent],
};

export default TextInputsPage;
