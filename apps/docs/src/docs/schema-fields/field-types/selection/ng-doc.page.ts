import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';
import FieldTypesCategory from '../ng-doc.category';

const SelectionFieldsPage: NgDocPage = {
  title: 'Selection Fields',
  mdFile: './index.md',
  category: FieldTypesCategory,
  order: 2,
  imports: [LiveExampleComponent],
};

export default SelectionFieldsPage;
