import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';
import FieldTypesCategory from '../ng-doc.category';

const UtilityFieldsPage: NgDocPage = {
  title: 'Utility Fields',
  mdFile: './index.md',
  category: FieldTypesCategory,
  order: 5,
  imports: [LiveExampleComponent],
};

export default UtilityFieldsPage;
